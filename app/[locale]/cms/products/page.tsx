import { getTranslations } from 'next-intl/server';
import { connectToMongo } from '@/clients/mongodb/mongodb';
import { findAllProducts } from '@/models/products/productsModel';
import { ProductsPage } from './ProductsPage';

interface IProductsPageProps {
  params: Promise<{
    locale: string;
  }>;
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
  }>;
}

export default async function Page({ params, searchParams }: IProductsPageProps) {
  const { locale } = await params;
  const { page: pageParam, pageSize: pageSizeParam } = await searchParams;

  const page = pageParam ? parseInt(pageParam) : 1;
  const pageSize = pageSizeParam ? parseInt(pageSizeParam) : 10;

  const t = await getTranslations({ locale, namespace: 'api.products' });

  if (page < 1 || pageSize < 1 || pageSize > 100) {
    throw new Error(t('invalidPaginationParameters'));
  }

  const db = await connectToMongo();
  const offset = (page - 1) * pageSize;
  const { products, total } = await findAllProducts(db, pageSize, offset);

  const totalPages = Math.ceil(total / pageSize);

  const data = {
    products,
    pagination: {
      page,
      pageSize,
      total,
      totalPages,
    },
  };

  return <ProductsPage locale={locale} data={data} />;
}
