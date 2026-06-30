import {
  Response,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  HttpException,
  HttpStatus,
  Query,
  UsePipes,
  UseInterceptors,
  UploadedFiles,
  Req,
  UseGuards,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UserService } from './user.service';
import { ValidationPipe } from '../../pipes/validation/validation';
import { UserDto } from './dto/user-public.dto';
import { AuthGuard } from '../../guards/auth/auth';
import { LoginBody } from '@francesco-lucania-pizza-models';
import { UserLoginDto } from './dto/user-login.dto';
import { normalizePhone } from '@francesco-lucania-pizza/utils';

@Controller('/user')
export class UserController {
  constructor(private userService: UserService) {}

  @UsePipes(ValidationPipe)
  @Post('/create')
  // @UseInterceptors(FileFieldsInterceptor([
  //   { name: 'avatar', maxCount: 1 },
  // ]))
  public async create(
    // @UploadedFiles() avatar,
    @Body() dto: CreateUserDto,
    @Response() response,
  ) {
    // const picture = avatar?.avatar[0];
    // Нормализуем телефон перед передачей в service
    const normalizedDto = {
      ...dto,
      phone: normalizePhone(dto.phone),
    };
    
    console.log('=== РЕГИСТРАЦИЯ ПОЛЬЗОВАТЕЛЯ ===');
    console.log('Входящие данные регистрации:', {
      email: normalizedDto.email,
      phone: normalizedDto.phone,
      name: normalizedDto.name,
      fullName: normalizedDto.fullName,
      gender: normalizedDto.gender,
      dateIssue: normalizedDto.dateIssue,
      password: normalizedDto.password, // Внимание: пароль в открытом виде
    });
    
    const user = await this.userService.create(normalizedDto);
    
    return response.send(user);
  }

  @UseGuards(AuthGuard)
  @Post('/uploadAvatar')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'avatar', maxCount: 1 }]))
  public async uploadAvatar(
    @UploadedFiles() avatar,
    @Req() request,
    @Response() res,
  ) {
    const file = avatar?.avatar?.[0];
    if (!file) {
      return res.status(400).send({ error: 'NO_FILE' });
    }

    const token = request?.headers.authorization?.split(' ')?.[1];
    const picturePath = await this.userService.saveAvatar(file, token);
    return res.send({ picture: picturePath });
  }

  @Get('/activate')
  public async activate(@Query() query: { id: string }, @Response() res) {
    try {
      const user = await this.userService.activate(query.id);
      return res.send({
        activation: user.isActivated,
        userInfo: {
          name: user.name,
          fullName: user.fullName,
          email: user.email,
        },
      });
    } catch (e) {
      throw new HttpException(
        {
          status: e.status,
          error: e.message,
        },
        HttpStatus.FORBIDDEN,
        {
          cause: e,
        },
      );
    }
  }

  @UsePipes(ValidationPipe)
  @Post('/login')
  public async login(
    @Body() body: UserLoginDto,
    @Response() response: UserDto,
  ) {
    // Нормализуем телефон перед передачей в service, если вход по телефону
    const normalizedBody = {
      ...body,
      login: body.loginType === 'phone' ? normalizePhone(body.login) : body.login,
    };
    
    console.log('=== АУТЕНТИФИКАЦИЯ ПОЛЬЗОВАТЕЛЯ ===');
    console.log('Входящие данные логина:', {
      login: normalizedBody.login,
      password: normalizedBody.password, // Пароль, присылаемый пользователем
      loginType: normalizedBody.loginType,
    });
    
    const user = await this.userService.login(normalizedBody);
    this.setRefreshToken(response, user).send(user);
  }

  @Get('/logout')
  public async logout(@Req() request, @Response() response) {
    await this.userService.logout(request.cookies.refreshToken);
    response.clearCookie('refreshToken');
    return response.send({ action: 'LOGOUT' });
  }

  @Get('/refresh')
  public async refresh(@Req() request, @Response() response) {
    const refreshToken = request.cookies?.refreshToken;
    if (!refreshToken) {
      throw new HttpException(
        {
          status: HttpStatus.UNAUTHORIZED,
          error: 'REFRESH_TOKEN_MISSING',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
    const user = await this.userService.refresh(refreshToken);
    this.setRefreshToken(response, user).send(user);
  }

  @UseGuards(AuthGuard)
  @Get('/getUserData')
  public async getUserData(@Req() request, @Response() response) {
    const token = request?.headers.authorization?.split(' ')?.[1];
    const userData = await this.userService.getUserData(token);
    response.send(userData);
  }

  @UseGuards(AuthGuard)
  @UsePipes(ValidationPipe)
  @Put('/update')
  public async updateUserData(
    @Req() request,
    @Body() dto: UpdateUserDto,
    @Response() response,
  ) {
    const token = request?.headers.authorization?.split(' ')?.[1];
    const normalizedDto = dto.phone
      ? { ...dto, phone: normalizePhone(dto.phone) }
      : dto;
    const userData = await this.userService.updateUserData(token, normalizedDto);
    response.send(userData);
  }

  @UseGuards(AuthGuard)
  @UsePipes(ValidationPipe)
  @Put('/updatePassword')
  public async updatePassword(
    @Req() request,
    @Body() dto: UpdatePasswordDto,
    @Response() response,
  ) {
    const token = request?.headers.authorization?.split(' ')?.[1];
    const userData = await this.userService.updatePassword(token, dto);
    response.send(userData);
  }

  private setRefreshToken(response: any, user: UserDto): any {
    if (user?.refreshToken) {
      return response.cookie('refreshToken', user.refreshToken, {
        maxAge: 30 * 24 * 60 * 100,
        httpOnly: true,
      });
    }

    return response;
  }

  @Get('/deleteAllUsers')
  public deleteAllUsers() {
    return this.userService.deleteAllUsers();
  }
}
