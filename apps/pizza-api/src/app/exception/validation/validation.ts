import { HttpException } from '@nestjs/common';
import { HttpStatusCode } from 'axios';

export default class ValidationException extends HttpException {
  public messages;

  constructor(response) {
    super(response, HttpStatusCode.BadRequest);
    this.messages = response;
  }
}
