import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Dish, DishDocument } from './schemas/dish.schema';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MenuService {
  constructor(
    @InjectModel(Dish.name) private dishModel: Model<DishDocument>,
    private configService: ConfigService,
  ) {}

  public async addDish(data: any): Promise<DishDocument> {
    const date = new Date().toISOString();
    const dish = await this.dishModel.create({
      ...data,
      created: date,
      isActive: data.isActive !== undefined ? data.isActive : false,
      picture: data.picture || 'unknown.jpg',
    });
    return dish;
  }

  public async deleteAllDishes(): Promise<null> {
    if (this.configService.get('MODE') === 'DEV') {
      await this.dishModel.collection.drop();
    }
    return null;
  }
}
