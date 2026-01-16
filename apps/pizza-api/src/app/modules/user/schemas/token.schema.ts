import mongoose from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type TokenDocument = Token &
  Document & {
    email: string;
    id: string;
    isActivated: boolean;
    iat: number;
    exp: number;
  };

@Schema()
export class Token {
  @Prop({ type: [{ type: mongoose.Types.ObjectId, ref: 'User' }] })
  user: mongoose.Types.ObjectId;

  @Prop({ required: true })
  refreshToken: mongoose.Types.ObjectId;

  @Prop()
  ip: string;
}

export const TokenSchema = SchemaFactory.createForClass(Token);
