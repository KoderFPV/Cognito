'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ProductsPageTemplate } from '@/template/app/[locale]/cms/products/ProductsPageTemplate';
import { IColumn } from '@/components/tables/Table/TableHeader';
import { IProduct } from '@/domain/product';

interface IProductsData {
  products: IProduct[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export const ProductsPage = ({ locale, data }: { locale: string; data: IProductsData }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations('product.list');

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

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(page));
    params.set('pageSize', String(data.pagination.pageSize));
    router.push(`?${params.toString()}`);
  };

  const handlePageSizeChange = (pageSize: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', '1');
    params.set('pageSize', String(pageSize));
    router.push(`?${params.toString()}`);
  };

  return (
    <ProductsPageTemplate
      columns={columns}
      products={data.products}
      error=""
      pagination={data.pagination}
      onRowClick={handleRowClick}
      onAddProduct={handleAddProduct}
      onPageChange={handlePageChange}
      onPageSizeChange={handlePageSizeChange}
      title={t('title')}
      addButtonLabel={t('addButton')}
      emptyMessage={t('empty')}
    />
  );
};
