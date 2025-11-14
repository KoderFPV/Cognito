'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DeleteProductModalTemplate } from '@/template/components/modals/DeleteProductModal/DeleteProductModalTemplate';
import { deleteProductViaApi } from '@/repositories/api/products/productsApiRepository';

export interface IDeleteProductModalProps {
  isOpen: boolean;
  productId: string;
  productName: string;
  locale: string;
  onClose: () => void;
  onDeleteSuccess: () => void;
  onDeleteError: (error: string) => void;
}

export const DeleteProductModal = ({
  isOpen,
  productId,
  productName,
  locale,
  onClose,
  onDeleteSuccess,
  onDeleteError,
}: IDeleteProductModalProps) => {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirmDelete = async () => {
    setIsDeleting(true);

    try {
      await deleteProductViaApi(productId);
      onDeleteSuccess();
      router.push(`/${locale}/cms/products`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to delete product';
      onDeleteError(errorMessage);
      setIsDeleting(false);
    }
  };

  return (
    <DeleteProductModalTemplate
      isOpen={isOpen}
      productName={productName}
      isDeleting={isDeleting}
      onConfirm={handleConfirmDelete}
      onCancel={onClose}
    />
  );
};
