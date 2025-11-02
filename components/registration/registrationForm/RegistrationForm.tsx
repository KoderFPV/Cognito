'use client';

import { useTranslations } from 'next-intl';
import { RegistrationFormTemplate } from '@/template/components/RegistrationForm/RegistrationFormTemplate';
import { useRegistrationForm } from './useRegistrationForm';

export const RegistrationForm = () => {
  const t = useTranslations('registration');
  const {
    email,
    password,
    confirmPassword,
    termsAccepted,
    isLoading,
    error,
    validationErrors,
    handleEmailChange,
    handlePasswordChange,
    handleConfirmPasswordChange,
    handleTermsChange,
    handleSubmit,
    handleCancel,
  } = useRegistrationForm();

  return (
    <RegistrationFormTemplate
      title={t('title')}
      subtitle={t('subtitle')}
      emailLabel={t('email')}
      passwordLabel={t('password')}
      confirmPasswordLabel={t('confirmPassword')}
      termsLabel={t('terms')}
      submitLabel={t('submit')}
      cancelLabel={t('cancel')}
      email={email}
      password={password}
      confirmPassword={confirmPassword}
      termsAccepted={termsAccepted}
      isLoading={isLoading}
      error={error}
      validationErrors={validationErrors}
      onEmailChange={handleEmailChange}
      onPasswordChange={handlePasswordChange}
      onConfirmPasswordChange={handleConfirmPasswordChange}
      onTermsChange={handleTermsChange}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
    />
  );
};
