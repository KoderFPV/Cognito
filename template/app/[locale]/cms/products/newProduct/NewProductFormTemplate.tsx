import { useTranslations } from 'next-intl';
import styles from './NewProductFormTemplate.module.scss';

export interface INewProductFormTemplateProps {
  locale: string;

  name: string;
  nameError: string;
  nameTouched: boolean;
  onNameChange: (value: string) => void;
  onNameBlur: () => void;

  description: string;
  descriptionError: string;
  descriptionTouched: boolean;
  onDescriptionChange: (value: string) => void;
  onDescriptionBlur: () => void;

  price: string;
  priceError: string;
  priceTouched: boolean;
  onPriceChange: (value: string) => void;
  onPriceBlur: () => void;

  sku: string;
  skuError: string;
  skuTouched: boolean;
  onSkuChange: (value: string) => void;
  onSkuBlur: () => void;

  stock: string;
  stockError: string;
  stockTouched: boolean;
  onStockChange: (value: string) => void;
  onStockBlur: () => void;

  category: string;
  onCategoryChange: (value: string) => void;

  isActive: boolean;
  onIsActiveChange: (value: boolean) => void;

  imagePreview: string;
  imageError: string;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;

  isSubmitting: boolean;
  submitError: string;
  submitSuccess: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export const NewProductFormTemplate = ({
  locale,
  name,
  nameError,
  nameTouched,
  onNameChange,
  onNameBlur,
  description,
  descriptionError,
  descriptionTouched,
  onDescriptionChange,
  onDescriptionBlur,
  price,
  priceError,
  priceTouched,
  onPriceChange,
  onPriceBlur,
  sku,
  skuError,
  skuTouched,
  onSkuChange,
  onSkuBlur,
  stock,
  stockError,
  stockTouched,
  onStockChange,
  onStockBlur,
  category,
  onCategoryChange,
  isActive,
  onIsActiveChange,
  imagePreview,
  imageError,
  onImageChange,
  isSubmitting,
  submitError,
  submitSuccess,
  onSubmit,
  onCancel,
}: INewProductFormTemplateProps) => {
  const t = useTranslations('product.form');

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{t('title')}</h1>

      <form className={styles.form} onSubmit={onSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="name" className={styles.label}>
            {t('name')} {t('required')}
          </label>
          <input
            id="name"
            type="text"
            className={`${styles.input} ${nameTouched && nameError ? styles.inputError : ''}`}
            value={name}
            onChange={(e) => {
              onNameChange(e.target.value);
            }}
            onBlur={onNameBlur}
            disabled={isSubmitting}
          />
          {nameTouched && nameError && (
            <span className={styles.error}>{nameError}</span>
          )}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="description" className={styles.label}>
            {t('description')} {t('required')}
          </label>
          <textarea
            id="description"
            className={`${styles.textarea} ${descriptionTouched && descriptionError ? styles.inputError : ''}`}
            value={description}
            onChange={(e) => {
              onDescriptionChange(e.target.value);
            }}
            onBlur={onDescriptionBlur}
            disabled={isSubmitting}
            rows={5}
          />
          {descriptionTouched && descriptionError && (
            <span className={styles.error}>{descriptionError}</span>
          )}
        </div>

        <div className={styles.row}>
          <div className={styles.formGroup}>
            <label htmlFor="price" className={styles.label}>
              {t('price')} {t('required')}
            </label>
            <input
              id="price"
              type="text"
              className={`${styles.input} ${priceTouched && priceError ? styles.inputError : ''}`}
              value={price}
              onChange={(e) => {
                onPriceChange(e.target.value);
              }}
              onBlur={onPriceBlur}
              disabled={isSubmitting}
              placeholder="0.00"
            />
            {priceTouched && priceError && (
              <span className={styles.error}>{priceError}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="sku" className={styles.label}>
              {t('sku')} {t('required')}
            </label>
            <input
              id="sku"
              type="text"
              className={`${styles.input} ${skuTouched && skuError ? styles.inputError : ''}`}
              value={sku}
              onChange={(e) => {
                onSkuChange(e.target.value);
              }}
              onBlur={onSkuBlur}
              disabled={isSubmitting}
            />
            {skuTouched && skuError && (
              <span className={styles.error}>{skuError}</span>
            )}
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.formGroup}>
            <label htmlFor="stock" className={styles.label}>
              {t('stock')} {t('required')}
            </label>
            <input
              id="stock"
              type="text"
              className={`${styles.input} ${stockTouched && stockError ? styles.inputError : ''}`}
              value={stock}
              onChange={(e) => {
                onStockChange(e.target.value);
              }}
              onBlur={onStockBlur}
              disabled={isSubmitting}
              placeholder="0"
            />
            {stockTouched && stockError && (
              <span className={styles.error}>{stockError}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="category" className={styles.label}>
              {t('category')}
            </label>
            <input
              id="category"
              type="text"
              className={styles.input}
              value={category}
              onChange={(e) => {
                onCategoryChange(e.target.value);
              }}
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="image" className={styles.label}>
            {t('image')}
          </label>
          <input
            id="image"
            type="file"
            className={styles.fileInput}
            onChange={onImageChange}
            disabled={isSubmitting}
            accept="image/jpeg,image/png,image/webp"
          />
          {imageError && <span className={styles.error}>{imageError}</span>}
          {imagePreview && (
            <div className={styles.imagePreview}>
              <img src={imagePreview} alt="Preview" className={styles.previewImage} />
            </div>
          )}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => {
                onIsActiveChange(e.target.checked);
              }}
              disabled={isSubmitting}
              className={styles.checkbox}
            />
            <span>{t('isActive')}</span>
          </label>
        </div>

        {submitError && (
          <div className={styles.submitError}>{submitError}</div>
        )}

        {submitSuccess && (
          <div className={styles.submitSuccess}>
            {t('successMessage')}
          </div>
        )}

        <div className={styles.actions}>
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className={styles.cancelButton}
          >
            {t('cancel')}
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={styles.submitButton}
          >
            {isSubmitting ? t('submitting') : t('submit')}
          </button>
        </div>
      </form>
    </div>
  );
};
