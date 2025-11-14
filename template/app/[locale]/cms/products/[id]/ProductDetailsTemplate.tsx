'use client';

import { useTranslations } from 'next-intl';
import { IProduct } from '@/domain/product';
import styles from './ProductDetailsTemplate.module.scss';

export interface IProductDetailsTemplateProps {
  product: IProduct | null;
  error?: string | null;
  deleteError?: string | null;
  onBack: () => void;
  onDelete?: () => void;
}

export const ProductDetailsTemplate = ({
  product,
  error,
  deleteError,
  onBack,
  onDelete,
}: IProductDetailsTemplateProps) => {
  const t = useTranslations('product.details');

  if (error || !product) {
    return (
      <div className={styles.container}>
        <button className={styles.backButton} onClick={onBack}>
          ← {t('back')}
        </button>
        <div className={styles.error}>{error || t('notFound')}</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={onBack}>
          ← {t('back')}
        </button>

        {!product.deleted && onDelete && (
          <button className={styles.deleteButton} onClick={onDelete}>
            {t('delete')}
          </button>
        )}
      </div>

      {deleteError && <div className={styles.errorMessage}>{deleteError}</div>}

      <div className={styles.content}>
        <div className={styles.imageSection}>
          {product.imageUrl && (
            <img
              src={product.imageUrl}
              alt={product.name}
              className={styles.image}
            />
          )}
          {!product.imageUrl && (
            <div className={styles.imagePlaceholder}>{t('noImage')}</div>
          )}
        </div>

        <div className={styles.detailsSection}>
          <h1 className={styles.title}>{product.name}</h1>

          <div className={styles.detailRow}>
            <span className={styles.label}>{t('description')}:</span>
            <span className={styles.value}>{product.description}</span>
          </div>

          <div className={styles.detailRow}>
            <span className={styles.label}>{t('price')}:</span>
            <span className={styles.value}>${Number(product.price).toFixed(2)}</span>
          </div>

          <div className={styles.detailRow}>
            <span className={styles.label}>{t('sku')}:</span>
            <span className={styles.value}>{product.sku}</span>
          </div>

          <div className={styles.detailRow}>
            <span className={styles.label}>{t('stock')}:</span>
            <span className={styles.value}>{product.stock}</span>
          </div>

          <div className={styles.detailRow}>
            <span className={styles.label}>{t('category')}:</span>
            <span className={styles.value}>{product.category}</span>
          </div>

          <div className={styles.detailRow}>
            <span className={styles.label}>{t('status')}:</span>
            <span className={styles.value}>
              {product.isActive ? t('active') : t('inactive')}
            </span>
          </div>

          {product.deleted && (
            <div className={styles.detailRow}>
              <span className={styles.label}>{t('status')}:</span>
              <span className={styles.deleted}>{t('deleted')}</span>
            </div>
          )}

          <div className={styles.detailRow}>
            <span className={styles.label}>{t('created')}:</span>
            <span className={styles.value}>
              {new Date(product.createdAt).toLocaleString()}
            </span>
          </div>

          <div className={styles.detailRow}>
            <span className={styles.label}>{t('updated')}:</span>
            <span className={styles.value}>
              {new Date(product.updatedAt).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
