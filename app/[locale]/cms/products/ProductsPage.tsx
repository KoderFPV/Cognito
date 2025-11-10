'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useProductsList } from '@/components/product/productsList/useProductsList';
import { ProductsPageTemplate } from '@/template/app/[locale]/cms/products/ProductsPageTemplate';
import { IColumn } from '@/components/tables/Table/TableHeader';
import { IProduct } from '@/domain/product';

const DEFAULT_PAGE_SIZE = 10;

export const ProductsPage = ({ locale }: { locale: string }) => {
  const router = useRouter();
  const t = useTranslations('product.list');
  const { products, isLoading, error, pagination, setPage, setPageSize } = useProductsList(DEFAULT_PAGE_SIZE);

  const columns: IColumn<IProduct>[] = [
    {
      key: 'name',
      label: t('name'),
      sortable: true,
    },
    {
      key: 'price',
      label: t('price'),
      sortable: true,
      render: (value) => `$${Number(value).toFixed(2)}`,
    },
    {
      key: 'sku',
      label: t('sku'),
      sortable: true,
    },
    {
      key: 'stock',
      label: t('stock'),
      sortable: true,
    },
  ];

  const handleRowClick = (product: IProduct) => {
    router.push(`/${locale}/cms/products/${product._id}`);
  };

  const handleAddProduct = () => {
    router.push(`/${locale}/cms/products/newProduct`);
  };

  return (
    <ProductsPageTemplate
      columns={columns}
      products={products}
      isLoading={isLoading}
      error={error}
      pagination={pagination}
      onRowClick={handleRowClick}
      onAddProduct={handleAddProduct}
      onPageChange={setPage}
      onPageSizeChange={setPageSize}
      title={t('title')}
      addButtonLabel={t('addButton')}
    />
  );
};
