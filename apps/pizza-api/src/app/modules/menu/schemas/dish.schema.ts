import mongoose from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type DishDocument = Dish & Document;

@Schema()
export class Dish {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true })
  description: string; // html

  @Prop({ required: true })
  ingredients: string; // html

  @Prop({ required: true })
  recipe: string; // html

  @Prop({ required: true })
  created: string;

  @Prop({ required: true, default: false })
  isActive: boolean;

  @Prop({ required: false, default: 'unknown.jpg' })
  picture: string;

  @Prop({ required: true, default: [] })
  images: string[];


  _id: mongoose.Types.ObjectId;
}

export const DishSchema = SchemaFactory.createForClass(Dish);
