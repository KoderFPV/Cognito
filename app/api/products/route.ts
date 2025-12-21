import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { getTranslations } from 'next-intl/server';
import { createProduct } from '@/services/product/productService';
import { getLocaleFromRequest } from '@/services/locale/locale.service';

export const POST = async (request: NextRequest) => {
  const locale = getLocaleFromRequest(request);
  const t = await getTranslations({ locale, namespace: 'api.product' });

  try {
    const body = await request.json();

    await createProduct(body, locale);

    return NextResponse.json(
      {
        message: t('created'),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Product creation error:', error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          message: t('validationFailed'),
          details: error.errors,
        },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      return NextResponse.json(
        { message: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: t('creationFailed') },
      { status: 500 }
    );
  }
};
