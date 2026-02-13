import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { FileService, FileType } from '../../services/file/file.service';
import { CreateUserDto } from './dto/create-user.dto';
import { MailService } from '../../services/mail/mail.service';
import bcrypt from 'bcryptjs';
import { TokenService, TokenType } from './services/token/token.service';
import { UserDto } from './dto/user-public.dto';
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from '@nestjs/config';
import ValidationException from '../../exception/validation/validation';
import UnauthorizedException from '../../exception/unauthorized/unauthorized';
import {
  LoginBody,
  LoginType,
  UserProfile,
} from '@francesco-lucania-pizza-models';
import { UserLoginDto } from './dto/user-login.dto';
import { normalizePhone } from '@francesco-lucania-pizza/utils';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private fileService: FileService,
    private mailService: MailService,
    private tokenService: TokenService,
    private configService: ConfigService,
  ) {}

  public async create(dto: CreateUserDto): Promise<UserDto> {
    // Нормализуем телефон перед поиском и сохранением
    const normalizedPhone = normalizePhone(dto.phone);
    const searchByEmail = await this.searchUserInModel({ email: dto.email });
    const searchByPhone = await this.searchUserInModel({ phone: normalizedPhone });
    const user = searchByEmail || searchByPhone;
    if (!user) {
      let picturePath;
      dto.password = await bcrypt.hash(dto.password, 3);

      // Проверяем, есть ли уже пользователи в БД
      const userCount = await this.userModel.countDocuments();
      const role = userCount === 0 ? 'admin' : 'guest';

      const activationLink = uuidv4();
      const date = new Date().toISOString();
      const creatUser = await this.userModel.create({
        ...dto,
        phone: normalizedPhone,
        picture: picturePath ? picturePath : 'unknown.jpg',
        activationLink,
        lastActivity: date,
        created: date,
        role,
      });

      console.log('=== ПОЛЬЗОВАТЕЛЬ УСПЕШНО СОЗДАН ===');
      console.log('Все данные созданного пользователя:', {
        _id: creatUser._id,
        email: creatUser.email,
        phone: creatUser.phone,
        name: creatUser.name,
        fullName: creatUser.fullName,
        gender: creatUser.gender,
        dateIssue: creatUser.dateIssue,
        password: creatUser.password, // Захешированный пароль
        picture: creatUser.picture,
        isActivated: creatUser.isActivated,
        activationLink: creatUser.activationLink,
        created: creatUser.created,
        lastActivity: creatUser.lastActivity,
      });

      this.mailService.sendActivationMail(
        dto.email,
        `${this.configService.get(
          'DOMAIN',
        )}/api/user/activate?id=${activationLink}`,
      );

      return await this.buildUserAuthData(new UserDto(creatUser));
    } else {
      throw new ValidationException(
        searchByPhone ? 'BUSY_PHONE' : 'BUSY_EMAIL',
      );
    }
  }

  public async saveAvatar(picture: any, token: string): Promise<string> {
    // Сохраняем аватар в подпапку user/avatar
    const picturePath = this.fileService.createFile(
      FileType.IMAGE,
      picture,
      'user/avatar',
    );

    // Получаем пользователя по токену и обновляем его аватар
    const user = await this.getUserByToken('ACCESS_TOKEN', token);
    if (user) {
      user.picture = picturePath;
      await user.save();
    }

    return picturePath;
  }

  public async login(body: UserLoginDto): Promise<UserDto> {
    const { login, password, loginType } = body;

    // Нормализуем телефон перед поиском, если вход по телефону
    const normalizedLogin = loginType === 'phone' ? normalizePhone(login) : login;

    const user =
      loginType === 'email'
        ? await this.searchUserInModel({ email: normalizedLogin })
        : await this.searchUserInModel({ phone: normalizedLogin });

    if (user) {
      console.log('=== СРАВНЕНИЕ ПАРОЛЕЙ ===');
      console.log('Логин:', login);
      console.log('Тип логина:', loginType);
      console.log('Пароль от пользователя (открытый):', password);
      console.log('Пароль из БД (захешированный):', user.password);
      
      if (!(await this.loginPasswordEquals(user, password))) {
        console.log('❌ Пароли НЕ совпадают');
        throw new ValidationException(`BAD_PASSWORD`);
      } else {
        console.log('✅ Пароли совпадают');
        if (user.isActivated) {
          user.lastActivity = new Date().toISOString();
          await user?.save();
          return await this.buildUserAuthData(new UserDto(user), true);
        } else {
          throw new ValidationException(`USER_NOT_ACTIVATED`);
        }
      }
    } else {
      console.log('❌ Пользователь не найден');
      throw new ValidationException(`USER_NOT_FOUND`);
    }
  }

  public async getUserData(token: string) {
    return this.buildUserProfileData(
      await this.getUserByToken('ACCESS_TOKEN', token),
    );
  }

  public buildUserProfileData(user: UserDocument): UserProfile {
    const {
      email,
      phone,
      name,
      fullName,
      gender,
      dateIssue,
      created,
      lastActivity,
      picture,
      role,
    } = user;

    return {
      email,
      phone,
      name,
      fullName,
      gender,
      dateIssue,
      created,
      lastActivity,
      picture,
      role,
    };
  }

  private async buildUserAuthData(user: UserDto, authData = false) {
    const tokens = this.tokenService.generateTokens({ ...user });

    if (authData) {
      await this.tokenService.saveToken(user.id, tokens);

      return {
        ...user,
        ...tokens,
      };
    }

    return { ...user };
  }

  private async loginPasswordEquals(
    user: User,
    password: string,
  ): Promise<boolean> {
    const result = await bcrypt.compare(password, user.password);
    return result;
  }

  public async logout(refreshToken: string): Promise<null> {
    return await this.tokenService.removeToken(refreshToken);
  }

  public async refresh(refreshToken: string): Promise<UserDto> {
    if (refreshToken) {
      const user = await this.getUserByToken('REFRESH_TOKEN', refreshToken);
      if (user) {
        return this.buildUserAuthData(new UserDto(user), true);
      }
    }
    throw new UnauthorizedException('BAD_TOKEN');
  }

  public async activate(link: string): Promise<User> {
    const activatedCandidate = await this.userModel.findOne({
      activationLink: link,
    });
    if (activatedCandidate) {
      activatedCandidate.isActivated = true;
      activatedCandidate.activationLink = null;
    } else {
      throw new Error('INCORRECT_LINK');
    }

    return await activatedCandidate.save();
  }

  private async searchUserInModel(
    searchParam: Partial<CreateUserDto>,
  ): Promise<UserDocument | null> {
    const user = await this.userModel.findOne(searchParam);
    return user ? user : null;
  }

  private async getUserByToken(
    type: TokenType,
    token: string,
  ): Promise<UserDocument> {
    const validToken = this.tokenService.validateToken(type, token);

    if (validToken) {
      if (type === 'REFRESH_TOKEN') {
        const tokenFromDb = await this.tokenService.findToken(token);
        if (!tokenFromDb) {
          return null;
        }
      }

      const user = await this.userModel.findById(validToken.id);

      return user ? user : null;
    }
    return null;
  }

  public async deleteAllUsers(): Promise<null> {
    if (this.configService.get('MODE') === 'DEV') {
      await this.tokenService.removeAll();
      await this.userModel.collection.drop();
    }
    return null;
  }
}
