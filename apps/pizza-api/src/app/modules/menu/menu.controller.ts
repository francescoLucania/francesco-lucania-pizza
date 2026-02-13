import {
  Controller,
  Post,
  Body,
  Response,
  HttpException,
  HttpStatus,
  UseGuards,
  UsePipes,
  UseInterceptors,
  UploadedFiles,
  Get,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { MenuService } from './menu.service';
import { AuthGuard } from '../../guards/auth/auth';
import { ValidationPipe } from '../../pipes/validation/validation';
import { CreateDishDto } from './dto/create-dish.dto';
import { FileService, FileType } from '../../services/file/file.service';

@Controller('/menu')
export class MenuController {
  constructor(
    private menuService: MenuService,
    private fileService: FileService,
  ) {}

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

  @UseGuards(AuthGuard)
  @UsePipes(ValidationPipe)
  @Post('/create')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'picture', maxCount: 1 }]),
  )
  public async create(
    @UploadedFiles() files,
    @Body() dto: CreateDishDto,
    @Response() response,
  ) {
    try {
      // Если передана картинка, сохраняем её по аналогии с аватаром
      const file = files?.picture?.[0];

      const data: CreateDishDto | (CreateDishDto & { picture: string }) =
        file
          ? {
              ...dto,
              picture: this.fileService.createFile(
                FileType.IMAGE,
                file,
                'menu/dishes',
              ),
            }
          : dto;

      const dish = await this.menuService.addDish(data);
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

  @Get('/deleteAllDishes')
  public deleteAllDishes() {
    return this.menuService.deleteAllDishes();
  }
}
