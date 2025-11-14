import { NextRequest, NextResponse } from 'next/server';
import { getTranslations } from 'next-intl/server';
import { connectToMongo } from '@/clients/mongodb/mongodb';
import { getProductById, deleteProduct } from '@/models/products/productsModel';
import { getLocaleFromRequest } from '@/services/locale/locale.service';
import { isAdminInApiRoute } from '@/services/auth/auth.helpers';

export const GET = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const locale = getLocaleFromRequest(request);
  const t = await getTranslations({ locale, namespace: 'api.product' });

  if (!id) {
    return NextResponse.json({ error: t('notFound') }, { status: 404 });
  }

  try {
    const db = await connectToMongo();
    const product = await getProductById(db, id);

    if (!product) {
      return NextResponse.json({ error: t('notFound') }, { status: 404 });
    }

    return NextResponse.json({ data: product });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ error: t('fetchFailed') }, { status: 500 });
  }
};

export const DELETE = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const locale = getLocaleFromRequest(request);
  const t = await getTranslations({ locale, namespace: 'api.product' });
  const tCommon = await getTranslations({ locale, namespace: 'common.errors' });

  const isAdmin = await isAdminInApiRoute(request);
  if (!isAdmin) {
    return NextResponse.json({ error: tCommon('forbidden') }, { status: 403 });
  }

  if (!id) {
    return NextResponse.json({ error: t('notFound') }, { status: 404 });
  }

  try {
    const db = await connectToMongo();
    const product = await getProductById(db, id);

    if (!product) {
      return NextResponse.json({ error: t('notFound') }, { status: 404 });
    }

    const deleted = await deleteProduct(db, id);

    if (!deleted) {
      return NextResponse.json({ error: t('deletionFailed') }, { status: 500 });
    }

    return NextResponse.json({ message: t('deleted') });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: t('deletionFailed') }, { status: 500 });
  }
};
