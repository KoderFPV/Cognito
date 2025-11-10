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
  title: string;
  addButtonLabel: string;
  emptyMessage: string;
  loadingMessage: string;
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
  title,
  addButtonLabel,
  emptyMessage,
  loadingMessage,
}: IProductsPageTemplateProps) => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>{title}</h1>
        <button className={styles.addButton} onClick={onAddProduct}>
          + {addButtonLabel}
        </button>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <Table
        data={products}
        columns={columns}
        isLoading={isLoading}
        onRowClick={onRowClick}
        emptyMessage={emptyMessage}
        loadingMessage={loadingMessage}
      />
    </div>
  );
};
