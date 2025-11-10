'use client';

import { NewProductFormTemplate } from '@/template/app/[locale]/cms/products/newProduct/NewProductFormTemplate';
import { useProductForm } from '@/components/product/productForm/useProductForm';
import { useParams } from 'next/navigation';

export const NewProductForm = () => {
  const params = useParams();
  const locale = params.locale as string;
  const {
    fields,
    imageUpload,
    isSubmitting,
    submitError,
    submitSuccess,
    handleSubmit,
    handleCancel,
  } = useProductForm();

  const createFieldProps = (field: typeof fields.name) => {
    return {
      value: field.value,
      error: field.error,
      touched: field.touched,
      onChange: (value: string) => {
        field.setValue(value);
        if (field.error) {
          field.setError('');
        }
      },
      onBlur: () => {
        field.setTouched(true);
      },
    };
  };

  return (
    <NewProductFormTemplate
      locale={locale}
      fields={{
        name: createFieldProps(fields.name),
        description: createFieldProps(fields.description),
        price: createFieldProps(fields.price),
        sku: createFieldProps(fields.sku),
        stock: createFieldProps(fields.stock),
        category: createFieldProps(fields.category),
      }}
      image={{
        preview: imageUpload.preview,
        error: imageUpload.error,
        onChange: imageUpload.handleFileChange,
      }}
      isActive={{
        value: fields.isActive.value,
        onChange: fields.isActive.setValue,
      }}
      formState={{
        isSubmitting,
        submitError,
        submitSuccess,
      }}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
    />
  );
};
