import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import mongoose from 'mongoose';
import { Dish, DishDocument } from './schemas/dish.schema';
import { Category, CategoryDocument } from './schemas/category.schema';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MenuService {
  constructor(
    @InjectModel(Dish.name) private dishModel: Model<DishDocument>,
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
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

  public async getAllDishes(
    limit?: number,
    skip?: number,
  ): Promise<{ dishes: DishDocument[]; total: number }> {
    const query = this.dishModel.find();
    const total = await this.dishModel.countDocuments();

    if (skip !== undefined) {
      query.skip(skip);
    }

    if (limit !== undefined) {
      query.limit(limit);
    }

    const dishes = await query.exec();

    return {
      dishes,
      total,
    };
  }

  public async addCategory(data: {
    name: string;
    description: string;
    list?: string[];
  }): Promise<CategoryDocument> {
    const category = await this.categoryModel.create({
      name: data.name,
      description: data.description,
      list: data.list || [],
    });
    return category;
  }

  public async getAllCategories(): Promise<CategoryDocument[]> {
    return this.categoryModel.find().exec();
  }

  public async getCategoryById(id: string): Promise<CategoryDocument | null> {
    return this.categoryModel.findById(id).exec();
  }

  public async updateCategory(
    id: string,
    data: {
      name?: string;
      description?: string;
      list?: string[];
    },
  ): Promise<CategoryDocument | null> {
    return this.categoryModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();
  }

  public async deleteCategory(id: string): Promise<boolean> {
    const result = await this.categoryModel.findByIdAndDelete(id).exec();
    return !!result;
  }
}
