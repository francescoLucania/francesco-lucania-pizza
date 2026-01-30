import mongoose from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {DishDocument} from "./dish.schema";

export type CategoryDocument = Category & Document;

@Schema()
export class Category {

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  list: mongoose.Types.ObjectId[];

  _id: mongoose.Types.ObjectId;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
