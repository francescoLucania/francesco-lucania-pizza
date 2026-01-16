import { HttpException } from '@nestjs/common';
import { HttpStatusCode } from 'axios';

export default class UnauthorizedException extends HttpException {
  public messages;

  constructor(response) {
    super(response, HttpStatusCode.Unauthorized);
    this.messages = response;
  }
}
