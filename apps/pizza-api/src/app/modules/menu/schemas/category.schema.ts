import mongoose from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {DishDocument} from "./dish.schema";

export type CategoryDocument = Category & Document;

@Schema()
export class Category {
  @Prop({ required: true })
  public name: string;

  @Prop({ required: true })
  public description: string;

  @Prop({ required: true })
  public list: mongoose.Types.ObjectId[];

  public _id: mongoose.Types.ObjectId;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
