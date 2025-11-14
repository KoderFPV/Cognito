'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DeleteConfirmationModalTemplate } from '@/template/components/modals/DeleteConfirmationModal/DeleteConfirmationModalTemplate';
import { deleteProductViaApi } from '@/repositories/api/products/productsApiRepository';

export interface IDeleteConfirmationModalProps {
  isOpen: boolean;
  productId: string;
  productName: string;
  locale: string;
  onClose: () => void;
  onDeleteSuccess: () => void;
  onDeleteError: (error: string) => void;
}

export const DeleteConfirmationModal = ({
  isOpen,
  productId,
  productName,
  locale,
  onClose,
  onDeleteSuccess,
  onDeleteError,
}: IDeleteConfirmationModalProps) => {
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
    <DeleteConfirmationModalTemplate
      isOpen={isOpen}
      productName={productName}
      isDeleting={isDeleting}
      onConfirm={handleConfirmDelete}
      onCancel={onClose}
    />
  );
};
