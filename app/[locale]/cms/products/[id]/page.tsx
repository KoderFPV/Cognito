import { connectToMongo } from '@/clients/mongodb/mongodb';
import { getProductById } from '@/models/products/productsModel';
import { ProductDetailsPage } from './ProductDetailsPage';
import { requireAdmin } from '@/services/auth/auth.helpers';
import { IProduct } from '@/domain/product';
import { getTranslations } from 'next-intl/server';

export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  await requireAdmin(locale);

  const t = await getTranslations({ locale, namespace: 'product.details' });

  let product: IProduct | null = null;
  let error: string | null = null;

  try {
    const db = await connectToMongo();
    product = await getProductById(db, id);
    if (!product) {
      error = t('notFound');
    }
  } catch (err) {
    error = t('fetchFailed');
  }

  return <ProductDetailsPage locale={locale} product={product} error={error} />;
}
