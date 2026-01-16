import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { FileService } from './file/file.service';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MailService } from '../services/mail/mail.service';
import { TokenService } from './services/token/token.service';
import { Token, TokenSchema } from './schemas/token.schema';
import { ConfigService } from '@nestjs/config';
import { NestjsFormDataModule } from 'nestjs-form-data';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Token.name, schema: TokenSchema },
    ]),
    NestjsFormDataModule,
  ],
  controllers: [UserController],
  providers: [
    ConfigService,
    UserService,
    FileService,
    MailService,
    TokenService,
  ],
})
export class UserModule {}
