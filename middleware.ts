import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n/config';
import { getToken } from 'next-auth/jwt';
import { ROLE } from '@/domain/user';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always'
});

export default async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const locale = pathname.split('/')[1];

  const isCmsRoute = pathname.includes('/cms');
  const isCmsLoginRoute = pathname.includes('/cms/login');

  if (isCmsRoute && !isCmsLoginRoute) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    });

    if (!token) {
      return NextResponse.redirect(
        new URL(`/${locale}/cms/login`, request.url)
      );
    }

    if (token.role !== ROLE.ADMIN) {
      return NextResponse.redirect(
        new URL(`/${locale}`, request.url)
      );
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: [
    '/((?!api|_next|_vercel|.*\\..*).*)'
  ]
};
