import { Gender } from './registration';

export type UserProfile = {
  email: string;
  phone: string;
  name: string;
  fullName: string;
  gender: Gender;
  dateIssue: string;
  created: string;
  lastActivity: string;
};
