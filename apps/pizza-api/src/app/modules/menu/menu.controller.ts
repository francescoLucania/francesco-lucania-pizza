import {
  Controller,
  Post,
  Body,
  Response,
  HttpException,
  HttpStatus,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { MenuService } from './menu.service';
import { AuthGuard } from '../../guards/auth/auth';
import { ValidationPipe } from '../../pipes/validation/validation';

@Controller('/menu')
export class MenuController {
  constructor(private menuService: MenuService) {}

  @UseGuards(AuthGuard)
  @UsePipes(ValidationPipe)
  @Post('/dish')
  public async addDish(@Body() body: any, @Response() response) {
    try {
      const dish = await this.menuService.addDish(body);
      return response.send(dish);
    } catch (e) {
      throw new HttpException(
        {
          status: e.status || HttpStatus.INTERNAL_SERVER_ERROR,
          error: e.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
        {
          cause: e,
        },
      );
    }
  }
}
