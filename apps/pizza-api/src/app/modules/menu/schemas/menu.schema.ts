import mongoose from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {CategoryDocument} from "./category.schema";

export type MenuDocument = Menu & Document;

@Schema()
export class Menu {
  @Prop({ required: true })
  public categories: CategoryDocument[];
  public popular: mongoose.Types.ObjectId[];
  public calendar: CategoryDocument[];
  public _id: mongoose.Types.ObjectId;
}

export const MenuSchema = SchemaFactory.createForClass(Menu);
