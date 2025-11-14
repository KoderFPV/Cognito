'use client';

import { useTranslations } from 'next-intl';
import styles from './DeleteConfirmationModalTemplate.module.scss';

export interface IDeleteConfirmationModalTemplateProps {
  isOpen: boolean;
  productName: string;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteConfirmationModalTemplate = ({
  isOpen,
  productName,
  isDeleting,
  onConfirm,
  onCancel,
}: IDeleteConfirmationModalTemplateProps) => {
  const t = useTranslations('product.details');

  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.title}>{t('deleteConfirmationTitle')}</h2>

        <p className={styles.message}>
          {t('deleteConfirmationMessage')}
        </p>

        <p className={styles.productName}>
          <strong>{productName}</strong>
        </p>

        <div className={styles.actions}>
          <button
            className={styles.cancelButton}
            onClick={onCancel}
            disabled={isDeleting}
          >
            {t('deleteConfirmationCancel')}
          </button>

          <button
            className={styles.deleteButton}
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? t('deleteConfirmationButton') : t('deleteConfirmationButton')}
          </button>
        </div>
      </div>
    </div>
  );
};
