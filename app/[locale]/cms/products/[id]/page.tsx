import { connectToMongo } from '@/clients/mongodb/mongodb';
import { getProductById } from '@/models/products/productsModel';
import { ProductDetailsPage } from './ProductDetailsPage';
import { requireAdmin } from '@/services/auth/auth.helpers';
import { IProduct } from '@/domain/product';

export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  await requireAdmin(locale);

  let product: IProduct | null = null;
  let error: string | null = null;

  try {
    const db = await connectToMongo();
    product = await getProductById(db, id);
    if (!product) {
      error = 'Product not found';
    }
  } catch (err) {
    error = 'Failed to fetch product';
  }

  return <ProductDetailsPage locale={locale} product={product} error={error} />;
}
