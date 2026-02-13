import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Dish, DishSchema } from './schemas/dish.schema';
import { MenuService } from './menu.service';
import { MenuController } from './menu.controller';
import { Category, CategorySchema } from './schemas/category.schema';
import { Menu, MenuSchema } from './schemas/menu.schema';
import { UserModule } from '../user/user.module';
import { FileService } from '../../services/file/file.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Menu.name, schema: MenuSchema },
      { name: Category.name, schema: CategorySchema },
      { name: Dish.name, schema: DishSchema },
    ]),
    UserModule,
  ],
  controllers: [MenuController],
  providers: [MenuService, FileService],
})
export class MenuModule {}
