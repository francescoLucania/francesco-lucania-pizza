import mongoose from 'mongoose';
import { User } from '../schemas/user.schema';

export class UserDto {
  email: string;
  fullName: string;
  lastActivity: string;
  phone: string;
  id: mongoose.Types.ObjectId;
  isActivated: boolean;
  refreshToken: string;
  accessToken: string;

  constructor(model: User) {
    this.email = model.email;
    this.phone = model.phone;
    this.fullName = model.fullName;
    this.lastActivity = model.lastActivity;
    this.id = model._id;
    this.isActivated = model.isActivated;
  }
}
