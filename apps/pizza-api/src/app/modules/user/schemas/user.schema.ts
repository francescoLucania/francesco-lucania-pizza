import mongoose, { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Gender } from '@francesco-lucania-pizza-models';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ unique: true, required: true })
  public email: string;

  @Prop({ required: true })
  public password: string;

  @Prop({ unique: true, required: true })
  public phone: string;

  @Prop({ required: true })
  public name: string;

  @Prop({ required: true })
  public fullName: string;

  @Prop({ type: String, required: true })
  public gender: Gender;

  @Prop({ required: true })
  public dateIssue: string;

  @Prop({ required: true })
  public created: string;

  @Prop({ required: true })
  public lastActivity: string;

  @Prop({ required: true, default: false })
  public isActivated: boolean;

  @Prop({ unique: false, required: false })
  public activationLink: string;

  @Prop({ required: false, default: 'unknown.jpg' })
  public picture: string;

  @Prop({
    type: String,
    enum: ['admin', 'user', 'guest'],
    default: 'guest',
    required: true,
  })
  public role: 'admin' | 'user' | 'guest';

  public _id: mongoose.Types.ObjectId;
}

export const UserSchema = SchemaFactory.createForClass(User);
