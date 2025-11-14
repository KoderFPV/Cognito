'use client';

import { useRouter } from 'next/navigation';
import { IProduct } from '@/domain/product';
import { ProductDetailsTemplate } from '@/template/app/[locale]/cms/products/[id]/ProductDetailsTemplate';
import { DeleteProductModal } from '@/components/modals/DeleteProductModal/DeleteProductModal';
import { useDeleteProductModal } from './useDeleteProductModal';

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
  const {
    isDeleteModalOpen,
    deleteError,
    handleDeleteClick,
    handleCloseDeleteModal,
    handleDeleteSuccess,
    handleDeleteError,
  } = useDeleteProductModal();

  const handleBack = () => {
    router.push(`/${locale}/cms/products`);
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
        <DeleteProductModal
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
