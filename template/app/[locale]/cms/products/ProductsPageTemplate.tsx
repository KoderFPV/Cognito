import { Table, IColumn } from '@/components/tables/Table/Table';
import { IProduct } from '@/domain/product';
import styles from './ProductsPageTemplate.module.scss';

export interface IProductsPageTemplateProps {
  columns: IColumn<IProduct>[];
  products: IProduct[];
  isLoading?: boolean;
  error?: string;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  onRowClick?: (product: IProduct) => void;
  onAddProduct: () => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export const ProductsPageTemplate = ({
  columns,
  products,
  isLoading,
  error,
  pagination,
  onRowClick,
  onAddProduct,
  onPageChange,
  onPageSizeChange,
}: IProductsPageTemplateProps) => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Products</h1>
        <button className={styles.addButton} onClick={onAddProduct}>
          + Add Product
        </button>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <Table
        data={products}
        columns={columns}
        isLoading={isLoading}
        onRowClick={onRowClick}
        emptyMessage="No products found"
        loadingMessage="Loading products..."
      />
    </div>
  );
};
