'use client';

import { useRouter } from 'next/navigation';
import { IProduct } from '@/domain/product';
import { ProductDetailsTemplate } from '@/template/app/[locale]/cms/products/[id]/ProductDetailsTemplate';

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

  const handleBack = () => {
    router.push(`/${locale}/cms/products`);
  };

  return (
    <ProductDetailsTemplate
      product={product}
      error={error}
      onBack={handleBack}
    />
  );
};
