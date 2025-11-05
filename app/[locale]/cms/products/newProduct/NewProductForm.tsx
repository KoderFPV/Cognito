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

  return (
    <NewProductFormTemplate
      locale={locale}
      name={fields.name.value}
      nameError={fields.name.error}
      nameTouched={fields.name.touched}
      onNameChange={(value) => {
        fields.name.setValue(value);
        if (fields.name.error) {
          fields.name.setError('');
        }
      }}
      onNameBlur={() => {
        fields.name.setTouched(true);
      }}
      description={fields.description.value}
      descriptionError={fields.description.error}
      descriptionTouched={fields.description.touched}
      onDescriptionChange={(value) => {
        fields.description.setValue(value);
        if (fields.description.error) {
          fields.description.setError('');
        }
      }}
      onDescriptionBlur={() => {
        fields.description.setTouched(true);
      }}
      price={fields.price.value}
      priceError={fields.price.error}
      priceTouched={fields.price.touched}
      onPriceChange={(value) => {
        fields.price.setValue(value);
        if (fields.price.error) {
          fields.price.setError('');
        }
      }}
      onPriceBlur={() => {
        fields.price.setTouched(true);
      }}
      sku={fields.sku.value}
      skuError={fields.sku.error}
      skuTouched={fields.sku.touched}
      onSkuChange={(value) => {
        fields.sku.setValue(value);
        if (fields.sku.error) {
          fields.sku.setError('');
        }
      }}
      onSkuBlur={() => {
        fields.sku.setTouched(true);
      }}
      stock={fields.stock.value}
      stockError={fields.stock.error}
      stockTouched={fields.stock.touched}
      onStockChange={(value) => {
        fields.stock.setValue(value);
        if (fields.stock.error) {
          fields.stock.setError('');
        }
      }}
      onStockBlur={() => {
        fields.stock.setTouched(true);
      }}
      category={fields.category.value}
      onCategoryChange={fields.category.setValue}
      isActive={fields.isActive.value}
      onIsActiveChange={fields.isActive.setValue}
      imagePreview={imageUpload.preview}
      imageError={imageUpload.error}
      onImageChange={imageUpload.handleFileChange}
      isSubmitting={isSubmitting}
      submitError={submitError}
      submitSuccess={submitSuccess}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
    />
  );
};
