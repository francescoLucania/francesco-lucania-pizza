import {HttpErrorResponse} from "@angular/common/http";

export type RegistrationBody = {
  email: string;
  phone: string;
  name: string;
  fullName: string;
  gender: string;
  dateIssue: string;
  password: string;
};

export type Gender = 'make' | 'female';

export enum RegistrationErrors {
  BusyPhone = 'BUSY_PHONE',
  BusyEmail = 'BUSY_EMAIL',
  BadEmail = 'BAD_EMAIL',
  EmailMustNotBeEmty = 'EMAIL_MUST_NOT_BE_EMPTY',

  IncorrectPhoneNumber = 'INCORRECT_PHONE_NUMBER',
  NotRussiaPhone = 'NOT_RUSSIAN_PHONE_NUMBER',
  PhoneMustNotBeEmty = 'PHONE_MUST_NOT_BE_EMPTY',
  NameMustNotBeEmty = 'NAME_MUST_NOT_BE_EMPTY',
  FullNameMustNotBeEmty = 'FULL_NAME_NAME_MUST_NOT_BE_EMPTY',
  GenderMustNotBeEmty = 'GENDER_MUST_NOT_BE_EMPTY',
  DateIssueMustNotBeEmty = 'DATE_ISSUE_MUST_NOT_BE_EMPTY',
  PasswordMustNotBeEmty = 'PASSWORD_MUST_NOT_BE_EMPTY',
  MinMaxError = 'MIN_8_MAX_16',
}

export type RegistrationError = HttpErrorResponse & {
  error: {
    message: RegistrationErrors;
  };
};

export type CreateResponse = {
  email: string;
  id: string;
  isActivated: boolean;
};
