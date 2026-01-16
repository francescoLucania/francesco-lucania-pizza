import mongoose from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Gender } from '@nx-neo-models';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ unique: true, required: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ unique: true, required: true })
  phone: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  fullName: string;

  @Prop({ type: String, required: true })
  gender: Gender;

  @Prop({ required: true })
  dateIssue: string;

  @Prop({ required: true })
  created: string;

  @Prop({ required: true })
  lastActivity: string;

  @Prop({ required: true, default: false })
  isActivated: boolean;

  @Prop({ unique: false, required: false })
  activationLink: string;

  _id: mongoose.Types.ObjectId;
}

export const UserSchema = SchemaFactory.createForClass(User);
