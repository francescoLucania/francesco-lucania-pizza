import { IsNotEmpty, IsString } from 'class-validator';

export class UserLoginDto {
  @IsString({ message: 'UserInformation должен быть строкой' })
  @IsNotEmpty({ message: 'Не должно быть пустым' })
  readonly login: string;
  @IsString({ message: 'UserInformation должен быть строкой' })
  @IsNotEmpty({ message: 'Не должно быть пустым' })
  readonly password: string;
  @IsNotEmpty({ message: 'Не должно быть пустым' })
  readonly loginType?: string;
}
