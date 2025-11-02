import { z } from 'zod';
import { getTranslations } from 'next-intl/server';
import { IUser, ROLE } from '@/domain/user';
import { hashPassword } from '@/services/auth/auth.service';
import { createUser, findUserByEmail } from '@/models/users/usersModel';

export const registrationSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).regex(/^(?=.*[A-Z])(?=.*\d).+$/),
  termsAccepted: z.boolean().refine((val) => val === true),
});

export type IRegistrationInput = z.infer<typeof registrationSchema>;

export const createUserAccount = async (
  data: IRegistrationInput,
  locale: string
): Promise<IUser> => {
  const t = await getTranslations({ locale, namespace: 'registration.errors' });

  const existingUser = await findUserByEmail(data.email);
  if (existingUser) {
    throw new Error(t('userExists'));
  }

  const hashedPassword = await hashPassword(data.password);

  const userData: Omit<IUser, '_id'> = {
    email: data.email,
    hash: hashedPassword,
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    postal: '',
    country: '',
    role: ROLE.CUSTOMER,
    activated: false,
    deleted: false,
    banned: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return createUser(userData);
};
