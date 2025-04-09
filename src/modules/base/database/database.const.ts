import { Prisma } from '@prisma/client';

export const USER_DEFAULT_SELECT: Prisma.UserSelect = {
  id: true,
  email: true,
  fullName: true,
  phoneNumber: true,
  status: true,
  dob: true,
  gender: true,
  address: true,
  imageLink: true,
  lastActive: true,
  language: true,
};
