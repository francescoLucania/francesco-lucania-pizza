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
  Query,
  Param,
  Put,
  Delete,
  Req,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { MenuService } from './menu.service';
import { AuthGuard } from '../../guards/auth/auth';
import { ValidationPipe } from '../../pipes/validation/validation';
import { CreateDishDto } from './dto/create-dish.dto';
import { GetDishesDto } from './dto/get-dishes.dto';
import { GetDishesByCategoryDto } from './dto/get-dishes-by-category.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { FileService, FileType } from '../../services/file/file.service';
import { TokenService } from '../user/services/token/token.service';

@Controller('/menu')
export class MenuController {
  constructor(
    private menuService: MenuService,
    private fileService: FileService,
    private tokenService: TokenService,
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
  @UseInterceptors(FileFieldsInterceptor([{ name: 'picture', maxCount: 1 }]))
  public async create(
    @UploadedFiles() files,
    @Body() dto: CreateDishDto,
    @Response() response,
  ) {
    try {
      // Если передана картинка, сохраняем её по аналогии с аватаром
      const file = files?.picture?.[0];

      const data: CreateDishDto | (CreateDishDto & { picture: string }) = file
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

  @Get('/dishes')
  @UsePipes(ValidationPipe)
  public async getAllDishes(
    @Query() query: GetDishesDto,
    @Response() response,
  ) {
    try {
      const result = await this.menuService.getAllDishes(
        query.limit,
        query.skip,
      );
      return response.send(result);
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

  @Get('/dish/:id')
  public async getDishById(
    @Param('id') id: string,
    @Req() request: Request,
    @Response() response,
  ) {
    try {
      const dish = await this.menuService.getDishById(id);
      if (!dish) {
        throw new HttpException(
          {
            status: HttpStatus.NOT_FOUND,
            error: 'Dish not found',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      const token = request?.headers?.authorization?.split(' ')?.[1];
      const decoded = token
        ? this.tokenService.validateToken('ACCESS_TOKEN', token)
        : null;
      const isAdmin = decoded?.role === 'admin';

      if (isAdmin) {
        return response.send(dish);
      }

      const { recipe: _recipe, ...dishWithoutRecipe } = JSON.parse(
        JSON.stringify(dish),
      );

      return response.send(dishWithoutRecipe);
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

  @Get('/dishes/category')
  @UsePipes(ValidationPipe)
  public async getDishesByCategory(
    @Query() query: GetDishesByCategoryDto,
    @Response() response,
  ) {
    try {
      const result = await this.menuService.getDishesByCategoryName(
        query.categoryName,
        query.limit,
        query.skip,
      );
      return response.send(result);
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
  @Post('/category')
  public async createCategory(
    @Body() dto: CreateCategoryDto,
    @Response() response,
  ) {
    try {
      const category = await this.menuService.addCategory(dto);
      return response.send(category);
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

  @Get('/categories')
  public async getAllCategories(@Response() response) {
    try {
      const categories = await this.menuService.getAllCategories();
      return response.send(categories);
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

  @Get('/category/:id')
  public async getCategoryById(@Param('id') id: string, @Response() response) {
    try {
      const category = await this.menuService.getCategoryById(id);
      if (!category) {
        throw new HttpException(
          {
            status: HttpStatus.NOT_FOUND,
            error: 'Category not found',
          },
          HttpStatus.NOT_FOUND,
        );
      }
      return response.send(category);
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
  @Put('/dish/:id')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'picture', maxCount: 1 }]))
  public async updateDish(
    @Param('id') id: string,
    @UploadedFiles() files,
    @Body() dto: Partial<CreateDishDto>,
    @Response() response,
  ) {
    try {
      const file = files?.picture?.[0];
      const data: Partial<CreateDishDto & { picture: string }> = file
        ? {
            ...dto,
            picture: this.fileService.createFile(
              FileType.IMAGE,
              file,
              'menu/dishes',
            ),
          }
        : dto;

      const dish = await this.menuService.updateDish(id, data);

      if (!dish) {
        throw new HttpException(
          {
            status: HttpStatus.NOT_FOUND,
            error: 'Dish not found',
          },
          HttpStatus.NOT_FOUND,
        );
      }

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
  @Delete('/dish/:id')
  public async deleteDish(@Param('id') id: string, @Response() response) {
    try {
      const deleted = await this.menuService.deleteDish(id);
      if (!deleted) {
        throw new HttpException(
          {
            status: HttpStatus.NOT_FOUND,
            error: 'Dish not found',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      return response.send({ success: true });
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
  @Put('/category/:id')
  public async updateCategory(
    @Param('id') id: string,
    @Body() dto: Partial<CreateCategoryDto>,
    @Response() response,
  ) {
    try {
      const category = await this.menuService.updateCategory(id, dto);
      if (!category) {
        throw new HttpException(
          {
            status: HttpStatus.NOT_FOUND,
            error: 'Category not found',
          },
          HttpStatus.NOT_FOUND,
        );
      }
      return response.send(category);
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
  @Delete('/category/:id')
  public async deleteCategory(@Param('id') id: string, @Response() response) {
    try {
      const deleted = await this.menuService.deleteCategory(id);
      if (!deleted) {
        throw new HttpException(
          {
            status: HttpStatus.NOT_FOUND,
            error: 'Category not found',
          },
          HttpStatus.NOT_FOUND,
        );
      }
      return response.send({ success: true });
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
