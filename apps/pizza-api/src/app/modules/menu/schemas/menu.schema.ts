import mongoose from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {CategoryDocument} from "./category.schema";

export type MenuDocument = Menu & Document;

@Schema()
export class Menu {

  @Prop({ required: true })
  categories: CategoryDocument[];
  popular: mongoose.Types.ObjectId[];
  calendar: CategoryDocument[];
  _id: mongoose.Types.ObjectId;
}

export const MenuSchema = SchemaFactory.createForClass(Menu);
