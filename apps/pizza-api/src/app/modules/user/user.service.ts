import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { FileService, FileType } from './file/file.service';
import { CreateUserDto } from './dto/create-user.dto';
import { MailService } from '../services/mail/mail.service';
import bcrypt from 'bcryptjs';
import { TokenService, TokenType } from './services/token/token.service';
import { UserDto } from './dto/user-public.dto';
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from '@nestjs/config';
import ValidationException from '../exception/validation/validation';
import UnauthorizedException from '../exception/unauthorized/unauthorized';
import { LoginBody, LoginType, UserProfile } from '@nx-neo-models';
import { UserLoginDto } from './dto/user-login.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private fileService: FileService,
    private mailService: MailService,
    private tokenService: TokenService,
    private configService: ConfigService
  ) {}

  async create(dto: CreateUserDto): Promise<UserDto> {
    const searchByEmail = await this.searchUserInModel({ email: dto.email });
    const searchByPhone = await this.searchUserInModel({ phone: dto.phone });
    const user = searchByEmail || searchByPhone;
    if (!user) {
      let picturePath;
      dto.password = await bcrypt.hash(dto.password, 3);

      const activationLink = uuidv4();
      const date = new Date();
      const creatUser = await this.userModel.create({
        ...dto,
        listens: 0,
        picture: picturePath ? picturePath : 'unknown.jpg',
        activationLink: activationLink,
        lastActivity: date,
        created: date,
      });

      this.mailService.sendActivationMail(
        dto.email,
        `${this.configService.get(
          'DOMAIN'
        )}/api/user/activate?id=${activationLink}`
      );

      return await this.buildUserAuthData(new UserDto(creatUser));
    } else {
      throw new ValidationException(
        searchByPhone ? 'BUSY_PHONE' : 'BUSY_EMAIL'
      );
    }
  }

  saveAvatar(picture: any) {
    const picturePath = this.fileService.createFile(FileType.IMAGE, picture);
  }

  async login(body: UserLoginDto): Promise<UserDto> {
    const { login, password, loginType } = body;

    console.log('login body', body);

    const user =
      loginType === 'email'
        ? await this.searchUserInModel({ email: login })
        : await this.searchUserInModel({ phone: login });

    if (user) {
      if (!(await this.loginPasswordEquals(user, password))) {
        throw new ValidationException(`BAD_PASSWORD`);
      } else if (user.isActivated) {
        user.lastActivity = new Date().toString();
        // @ts-ignore
        await user?.save();
        return await this.buildUserAuthData(new UserDto(user), true);
      } else {
        throw new ValidationException(`USER_NOT_ACTIVATED`);
      }
    } else {
      throw new ValidationException(`USER_NOT_FOUND`);
    }
  }

  public async getUserData(token: string) {
    return this.buildUserProfileData(
      await this.getUserByToken('ACCESS_TOKEN', token)
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
    password: string
  ): Promise<boolean> {
    const result = await bcrypt.compare(password, user.password);
    return result;
  }

  async logout(refreshToken: string): Promise<null> {
    return await this.tokenService.removeToken(refreshToken);
  }

  async refresh(refreshToken: string): Promise<UserDto> {
    if (refreshToken) {
      const user = await this.getUserByToken('REFRESH_TOKEN', refreshToken);
      if (user) {
        return this.buildUserAuthData(new UserDto(user), true);
      }
    }
    throw new UnauthorizedException('BAD_TOKEN');
  }

  async activate(link: string): Promise<User> {
    const activatedCandidate = await this.userModel.findOne({
      activationLink: link,
    });
    if (activatedCandidate) {
      activatedCandidate['isActivated'] = true;
      activatedCandidate['activationLink'] = null;
    } else {
      throw new Error('INCORRECT_LINK');
    }

    return await activatedCandidate.save();
  }

  private async searchUserInModel(
    searchParam: Partial<CreateUserDto>
  ): Promise<User | null> {
    const user = await this.userModel.findOne(searchParam);
    return user ? user : null;
  }

  private async getUserByToken(
    type: TokenType,
    token: string
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

      console.log('user => ', user);

      return user ? user : null;
    }
    return null;
  }

  async deleteAllUsers(): Promise<null> {
    if (this.configService.get('MODE') === 'DEV') {
      await this.tokenService.removeAll();
      await this.userModel.collection.drop();
    }
    return null;
  }
}
