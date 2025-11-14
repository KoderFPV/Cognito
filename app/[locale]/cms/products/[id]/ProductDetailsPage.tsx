'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { IProduct } from '@/domain/product';
import { ProductDetailsTemplate } from '@/template/app/[locale]/cms/products/[id]/ProductDetailsTemplate';
import { DeleteConfirmationModal } from '@/components/modals/DeleteConfirmationModal/DeleteConfirmationModal';

export const ProductDetailsPage = ({
  locale,
  product,
  error,
}: {
  locale: string;
  product: IProduct | null;
  error: string | null;
}) => {
  const router = useRouter();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleBack = () => {
    router.push(`/${locale}/cms/products`);
  };

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
    setDeleteError(null);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeleteError(null);
  };

  const handleDeleteSuccess = () => {
    setIsDeleteModalOpen(false);
    setDeleteError(null);
  };

  const handleDeleteError = (error: string) => {
    setDeleteError(error);
  };

  return (
    <>
      <ProductDetailsTemplate
        product={product}
        error={error}
        deleteError={deleteError}
        onBack={handleBack}
        onDelete={handleDeleteClick}
      />

      {product && (
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          productId={product._id}
          productName={product.name}
          locale={locale}
          onClose={handleCloseDeleteModal}
          onDeleteSuccess={handleDeleteSuccess}
          onDeleteError={handleDeleteError}
        />
      )}
    </>
  );
};
