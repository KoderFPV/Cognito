'use client';

import { useRouter } from 'next/navigation';
import { useProductsList } from '@/components/product/productsList/useProductsList';
import { ProductsPageTemplate } from '@/template/app/[locale]/cms/products/ProductsPageTemplate';
import { IColumn } from '@/components/tables/Table/TableHeader';
import { IProduct } from '@/domain/product';

export const ProductsPage = ({ locale }: { locale: string }) => {
  const router = useRouter();
  const { products, isLoading, error, pagination, setPage, setPageSize } = useProductsList(10);

  const columns: IColumn<IProduct>[] = [
    {
      key: 'name',
      label: 'Product Name',
      sortable: true,
    },
    {
      key: 'price',
      label: 'Price',
      sortable: true,
      render: (value) => `$${Number(value).toFixed(2)}`,
    },
    {
      key: 'sku',
      label: 'SKU',
      sortable: true,
    },
    {
      key: 'stock',
      label: 'Stock',
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
    />
  );
};
