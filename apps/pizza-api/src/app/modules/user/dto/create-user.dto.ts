import {
  IsEmail,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  Length,
} from 'class-validator';
import { Gender, RegistrationErrors } from '@nx-neo-models';

export class CreateUserDto {
  @IsEmail({}, { message: RegistrationErrors.BadEmail })
  @IsNotEmpty({ message: RegistrationErrors.EmailMustNotBeEmty })
  readonly email: string;
  @IsPhoneNumber('RU', { message: RegistrationErrors.IncorrectPhoneNumber })
  @IsNotEmpty({ message: RegistrationErrors.PhoneMustNotBeEmty })
  readonly phone: string;
  @IsNotEmpty({ message: RegistrationErrors.NameMustNotBeEmty })
  readonly name: string;
  @IsNotEmpty({ message: RegistrationErrors.FullNameMustNotBeEmty })
  readonly fullName: string;
  @IsNotEmpty({ message: RegistrationErrors.GenderMustNotBeEmty })
  readonly gender: Gender;
  @IsNotEmpty({ message: RegistrationErrors.DateIssueMustNotBeEmty })
  readonly dateIssue: string;
  @IsNotEmpty({ message: RegistrationErrors.PasswordMustNotBeEmty })
  @Length(8, 16, { message: RegistrationErrors.MinMaxError })
  password: string;
}
