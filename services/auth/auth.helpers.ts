import { auth } from './auth.config';
import { redirect } from 'next/navigation';
import { ROLE } from '@/domain/user';

export const getCurrentUser = async () => {
  const session = await auth();
  return session?.user ?? null;
};

export const requireAuth = async (locale: string) => {
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/${locale}/login`);
  }
  return user;
};

export const requireCmsAuth = async (locale: string) => {
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/${locale}/cms/login`);
  }
  return user;
};

export const requireAdmin = async (locale: string) => {
  const user = await requireCmsAuth(locale);
  if (user.role !== ROLE.ADMIN) {
    redirect(`/${locale}/cms/login`);
  }
  return user;
};

export const hasRole = async (role: ROLE): Promise<boolean> => {
  const user = await getCurrentUser();
  return user?.role === role;
};

export const isAuthenticated = async (): Promise<boolean> => {
  const user = await getCurrentUser();
  return user !== null;
};
