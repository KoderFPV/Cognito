import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { validateEmail, validatePassword } from '@/services/registration/registration.validation';
import { registerUser } from '@/repositories/api/registration/registrationApiRepository';

export const useRegistrationForm = () => {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations('registration');
  const tValidation = useTranslations('registration.validation');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (validationErrors.email) {
      setValidationErrors((prev) => ({ ...prev, email: undefined }));
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (validationErrors.password) {
      setValidationErrors((prev) => ({ ...prev, password: undefined }));
    }
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    if (validationErrors.confirmPassword) {
      setValidationErrors((prev) => ({ ...prev, confirmPassword: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const errors: {
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};

    if (!validateEmail(email)) {
      errors.email = tValidation('emailInvalid');
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.minLength) {
      errors.password = tValidation('passwordMinLength');
    } else if (!passwordValidation.hasUppercase) {
      errors.password = tValidation('passwordUppercase');
    } else if (!passwordValidation.hasNumber) {
      errors.password = tValidation('passwordNumber');
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = tValidation('passwordMismatch');
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await registerUser({
        email,
        password,
        termsAccepted,
      });

      router.push(`/${locale}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('errors.registrationFailed');
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    console.log('Cancel clicked');
  };

  return {
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
    handleTermsChange: setTermsAccepted,
    handleSubmit,
    handleCancel,
  };
};
