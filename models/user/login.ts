export type LoginType = 'phone' | 'email';

export type LoginBody = {
  login: string;
  password: string;
  loginType: LoginType;
};

export enum LoginErrors {
  BadPassword = 'BAD_PASSWORD',
  UserNotActivated = 'USER_NOT_ACTIVATED',
  UserNotFound = 'USER_NOT_FOUND',
}
