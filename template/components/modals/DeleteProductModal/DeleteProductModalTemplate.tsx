'use client';

import { useTranslations } from 'next-intl';
import { ModalTemplate, IModalAction } from '@/template/components/Modal/ModalTemplate';
import styles from './DeleteProductModalTemplate.module.scss';

export interface IDeleteProductModalTemplateProps {
  isOpen: boolean;
  productName: string;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteProductModalTemplate = ({
  isOpen,
  productName,
  isDeleting,
  onConfirm,
  onCancel,
}: IDeleteProductModalTemplateProps) => {
  const t = useTranslations('product.details');

  const actions: IModalAction[] = [
    {
      label: t('deleteConfirmationCancel'),
      onClick: onCancel,
      disabled: isDeleting,
      variant: 'secondary',
    },
    {
      label: t('deleteConfirmationButton'),
      onClick: onConfirm,
      disabled: isDeleting,
      variant: 'danger',
    },
  ];

  return (
    <ModalTemplate
      isOpen={isOpen}
      title={t('deleteConfirmationTitle')}
      actions={actions}
      onBackdropClick={onCancel}
    >
      <p className={styles.message}>{t('deleteConfirmationMessage')}</p>
      <p className={styles.productName}>
        <strong>{productName}</strong>
      </p>
    </ModalTemplate>
  );
};
