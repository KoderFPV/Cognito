import { useTranslations } from 'next-intl';
import styles from './NewProductFormTemplate.module.scss';

export interface IFormField {
  value: string;
  error: string;
  touched: boolean;
  onChange: (value: string) => void;
  onBlur: () => void;
}

export interface IImageField {
  preview: string;
  error: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface ICheckboxField {
  value: boolean;
  onChange: (value: boolean) => void;
}

export interface IFormState {
  isSubmitting: boolean;
  submitError: string;
  submitSuccess: boolean;
}

export interface INewProductFormTemplateProps {
  locale: string;
  fields: {
    name: IFormField;
    description: IFormField;
    price: IFormField;
    sku: IFormField;
    stock: IFormField;
    category: IFormField;
  };
  image: IImageField;
  isActive: ICheckboxField;
  formState: IFormState;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export const NewProductFormTemplate = ({
  locale,
  fields,
  image,
  isActive,
  formState,
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
            className={`${styles.input} ${fields.name.touched && fields.name.error ? styles.inputError : ''}`}
            value={fields.name.value}
            onChange={(e) => {
              fields.name.onChange(e.target.value);
            }}
            onBlur={fields.name.onBlur}
            disabled={formState.isSubmitting}
          />
          {fields.name.touched && fields.name.error && (
            <span className={styles.error}>{fields.name.error}</span>
          )}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="description" className={styles.label}>
            {t('description')} {t('required')}
          </label>
          <textarea
            id="description"
            className={`${styles.textarea} ${fields.description.touched && fields.description.error ? styles.inputError : ''}`}
            value={fields.description.value}
            onChange={(e) => {
              fields.description.onChange(e.target.value);
            }}
            onBlur={fields.description.onBlur}
            disabled={formState.isSubmitting}
            rows={5}
          />
          {fields.description.touched && fields.description.error && (
            <span className={styles.error}>{fields.description.error}</span>
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
              className={`${styles.input} ${fields.price.touched && fields.price.error ? styles.inputError : ''}`}
              value={fields.price.value}
              onChange={(e) => {
                fields.price.onChange(e.target.value);
              }}
              onBlur={fields.price.onBlur}
              disabled={formState.isSubmitting}
              placeholder="0.00"
            />
            {fields.price.touched && fields.price.error && (
              <span className={styles.error}>{fields.price.error}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="sku" className={styles.label}>
              {t('sku')} {t('required')}
            </label>
            <input
              id="sku"
              type="text"
              className={`${styles.input} ${fields.sku.touched && fields.sku.error ? styles.inputError : ''}`}
              value={fields.sku.value}
              onChange={(e) => {
                fields.sku.onChange(e.target.value);
              }}
              onBlur={fields.sku.onBlur}
              disabled={formState.isSubmitting}
            />
            {fields.sku.touched && fields.sku.error && (
              <span className={styles.error}>{fields.sku.error}</span>
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
              className={`${styles.input} ${fields.stock.touched && fields.stock.error ? styles.inputError : ''}`}
              value={fields.stock.value}
              onChange={(e) => {
                fields.stock.onChange(e.target.value);
              }}
              onBlur={fields.stock.onBlur}
              disabled={formState.isSubmitting}
              placeholder="0"
            />
            {fields.stock.touched && fields.stock.error && (
              <span className={styles.error}>{fields.stock.error}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="category" className={styles.label}>
              {t('category')} {t('required')}
            </label>
            <input
              id="category"
              type="text"
              className={`${styles.input} ${fields.category.touched && fields.category.error ? styles.inputError : ''}`}
              value={fields.category.value}
              onChange={(e) => {
                fields.category.onChange(e.target.value);
              }}
              onBlur={fields.category.onBlur}
              disabled={formState.isSubmitting}
            />
            {fields.category.touched && fields.category.error && (
              <span className={styles.error}>{fields.category.error}</span>
            )}
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
            onChange={image.onChange}
            disabled={formState.isSubmitting}
            accept="image/jpeg,image/png,image/webp"
          />
          {image.error && <span className={styles.error}>{image.error}</span>}
          {image.preview && (
            <div className={styles.imagePreview}>
              <img src={image.preview} alt="Preview" className={styles.previewImage} />
            </div>
          )}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={isActive.value}
              onChange={(e) => {
                isActive.onChange(e.target.checked);
              }}
              disabled={formState.isSubmitting}
              className={styles.checkbox}
            />
            <span>{t('isActive')}</span>
          </label>
        </div>

        {formState.submitError && (
          <div className={styles.submitError}>{formState.submitError}</div>
        )}

        {formState.submitSuccess && (
          <div className={styles.submitSuccess}>
            {t('successMessage')}
          </div>
        )}

        <div className={styles.actions}>
          <button
            type="button"
            onClick={onCancel}
            disabled={formState.isSubmitting}
            className={styles.cancelButton}
          >
            {t('cancel')}
          </button>
          <button
            type="submit"
            disabled={formState.isSubmitting}
            className={styles.submitButton}
          >
            {formState.isSubmitting ? t('submitting') : t('submit')}
          </button>
        </div>
      </form>
    </div>
  );
};
