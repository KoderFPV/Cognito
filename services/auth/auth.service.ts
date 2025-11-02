import bcrypt from 'bcryptjs';
import { IUser, ROLE } from '@/domain/user';
import {
  findUserByEmail,
  createUser as createUserInDb,
} from '@/models/users/usersModel';

export interface IRegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  postal: string;
  country: string;
}

export interface ILoginCredentials {
  email: string;
  password: string;
}

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const verifyPassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const registerUser = async (
  data: IRegisterData
): Promise<IUser> => {
  const existingUser = await findUserByEmail(data.email);
  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  const hashedPassword = await hashPassword(data.password);

  const userData: Omit<IUser, '_id'> = {
    email: data.email,
    hash: hashedPassword,
    firstName: data.firstName,
    lastName: data.lastName,
    phone: data.phone,
    address: data.address,
    city: data.city,
    postal: data.postal,
    country: data.country,
    role: ROLE.CUSTOMER,
    activated: false,
    deleted: false,
    banned: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return createUserInDb(userData);
};

export const validateUserCredentials = async (
  credentials: ILoginCredentials
): Promise<IUser | null> => {
  const user = await findUserByEmail(credentials.email);

  if (!user) {
    return null;
  }

  if (user.banned) {
    throw new Error('User account is banned');
  }

  const isValid = await verifyPassword(credentials.password, user.hash);

  return isValid ? user : null;
};
