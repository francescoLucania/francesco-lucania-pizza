import mongoose from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type DishDocument = Dish & Document;

@Schema()
export class Dish {
  @Prop({ required: true })
  public name: string;

  @Prop({ required: true })
  public fullName: string;

  @Prop({ required: true })
  public description: string; // html

  @Prop({ required: true })
  public ingredients: string; // html

  @Prop({ required: true })
  public recipe: string; // html

  @Prop({ required: true })
  public created: string;

  @Prop({ required: true, default: false })
  public isActive: boolean;

  @Prop({ required: false, default: 'unknown.jpg' })
  public picture: string;

  @Prop({ required: false, default: [] })
  public images: string[];

  public _id: mongoose.Types.ObjectId;
}

export const DishSchema = SchemaFactory.createForClass(Dish);
