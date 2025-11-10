import { ProductsPage } from './ProductsPage';

interface IProductsPageProps {
  params: {
    locale: string;
  };
}

export default function Page({ params }: IProductsPageProps) {
  return <ProductsPage locale={params.locale} />;
}
