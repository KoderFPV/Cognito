import styles from './RegistrationFormTemplate.module.scss';

export interface IRegistrationFormTemplateProps {
  title: string;
  subtitle: string;
  emailLabel: string;
  passwordLabel: string;
  confirmPasswordLabel: string;
  termsLabel: string;
  submitLabel: string;
  cancelLabel: string;
  email: string;
  password: string;
  confirmPassword: string;
  termsAccepted: boolean;
  isLoading: boolean;
  error: string | null;
  validationErrors: {
    email?: string;
    password?: string;
    confirmPassword?: string;
  };
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onTermsChange: (value: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export const RegistrationFormTemplate = ({
  title,
  subtitle,
  emailLabel,
  passwordLabel,
  confirmPasswordLabel,
  termsLabel,
  submitLabel,
  cancelLabel,
  email,
  password,
  confirmPassword,
  termsAccepted,
  isLoading,
  error,
  validationErrors,
  onEmailChange,
  onPasswordChange,
  onConfirmPasswordChange,
  onTermsChange,
  onSubmit,
  onCancel,
}: IRegistrationFormTemplateProps) => {
  return (
    <div className={styles.registrationForm}>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.subtitle}>{subtitle}</p>

      {error && <div className={styles.error}>{error}</div>}

      <form onSubmit={onSubmit} className={styles.form} noValidate>
        <div className={styles.formGroup}>
          <label htmlFor="email" className={styles.label}>
            {emailLabel}
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            className={`${styles.input} ${validationErrors.email ? styles.inputError : ''}`}
            disabled={isLoading}
            required
          />
          {validationErrors.email && (
            <span className={styles.fieldError}>{validationErrors.email}</span>
          )}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="password" className={styles.label}>
            {passwordLabel}
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            className={`${styles.input} ${validationErrors.password ? styles.inputError : ''}`}
            disabled={isLoading}
            required
          />
          {validationErrors.password && (
            <span className={styles.fieldError}>{validationErrors.password}</span>
          )}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="confirmPassword" className={styles.label}>
            {confirmPasswordLabel}
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={confirmPassword}
            onChange={(e) => onConfirmPasswordChange(e.target.value)}
            className={`${styles.input} ${validationErrors.confirmPassword ? styles.inputError : ''}`}
            disabled={isLoading}
            required
          />
          {validationErrors.confirmPassword && (
            <span className={styles.fieldError}>{validationErrors.confirmPassword}</span>
          )}
        </div>

        <div className={styles.checkboxGroup}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => onTermsChange(e.target.checked)}
              className={styles.checkbox}
              disabled={isLoading}
              required
            />
            <span>{termsLabel}</span>
          </label>
        </div>

        <div className={styles.buttonGroup}>
          <button
            type="button"
            onClick={onCancel}
            className={styles.cancelButton}
            disabled={isLoading}
          >
            {cancelLabel}
          </button>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
};
