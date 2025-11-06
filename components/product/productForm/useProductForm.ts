import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useFormField } from '@/components/forms/useFormField';
import { useImageUpload } from '@/components/forms/useImageUpload';
import { validateProductData } from '@/services/product/productValidation.service';
import { ZodError } from 'zod';

export const useProductForm = () => {
  const router = useRouter();
  const t = useTranslations('product');

  const name = useFormField<string>('');
  const description = useFormField<string>('');
  const price = useFormField<string>('');
  const sku = useFormField<string>('');
  const stock = useFormField<string>('');
  const category = useFormField<string>('');
  const isActive = useFormField<boolean>(true);

  const imageUpload = useImageUpload(5, ['image/jpeg', 'image/png', 'image/webp']);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const validateForm = useCallback((): boolean => {
    let isValid = true;

    if (!name.value.trim()) {
      name.setError(t('errors.nameRequired'));
      isValid = false;
    }

    if (!description.value.trim()) {
      description.setError(t('errors.descriptionRequired'));
      isValid = false;
    }

    if (!price.value.trim()) {
      price.setError(t('errors.priceRequired'));
      isValid = false;
    } else {
      const priceNum = parseFloat(price.value);
      if (isNaN(priceNum) || priceNum <= 0) {
        price.setError(t('errors.priceInvalid'));
        isValid = false;
      }
    }

    if (!sku.value.trim()) {
      sku.setError(t('errors.skuRequired'));
      isValid = false;
    }

    if (!stock.value.trim()) {
      stock.setError(t('errors.stockRequired'));
      isValid = false;
    } else {
      const stockNum = parseInt(stock.value);
      if (isNaN(stockNum) || stockNum < 0) {
        stock.setError(t('errors.stockInvalid'));
        isValid = false;
      }
    }

    return isValid;
  }, [name, description, price, sku, stock, t]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setSubmitError('');
      setSubmitSuccess(false);

      name.setTouched(true);
      description.setTouched(true);
      price.setTouched(true);
      sku.setTouched(true);
      stock.setTouched(true);

      if (!validateForm()) {
        return;
      }

      setIsSubmitting(true);

      try {
        const productData = {
          name: name.value,
          description: description.value,
          price: parseFloat(price.value),
          sku: sku.value,
          stock: parseInt(stock.value),
          category: category.value.trim() || undefined,
          imageUrl: imageUpload.preview || undefined,
          isActive: isActive.value,
        };

        validateProductData(productData);

        setSubmitSuccess(true);

        setTimeout(() => {
          router.push('/cms/products');
        }, 1500);
      } catch (error) {
        if (error instanceof ZodError) {
          setSubmitError(t('errors.validationFailed'));
        } else {
          setSubmitError(t('errors.submitFailed'));
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      name,
      description,
      price,
      sku,
      stock,
      category,
      isActive,
      imageUpload.preview,
      validateForm,
      router,
      t,
    ]
  );

  const handleCancel = useCallback(() => {
    router.push('/cms/products');
  }, [router]);

  return {
    fields: {
      name,
      description,
      price,
      sku,
      stock,
      category,
      isActive,
    },
    imageUpload,
    isSubmitting,
    submitError,
    submitSuccess,
    handleSubmit,
    handleCancel,
  };
};
