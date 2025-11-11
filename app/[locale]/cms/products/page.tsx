import { ProductsPage } from './ProductsPage';

interface IProductsPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function Page({ params }: IProductsPageProps) {
  const { locale } = await params;
  return <ProductsPage locale={locale} />;
}
