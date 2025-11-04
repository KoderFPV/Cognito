'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { LoginFormTemplate } from '@/template/components/LoginForm/LoginFormTemplate';

export const LoginForm = () => {
  const t = useTranslations('cms.login');
  const locale = useLocale();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(t('errors.invalidCredentials'));
        setIsLoading(false);
        return;
      }

      router.push(`/${locale}/cms`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t('errors.loginFailed')
      );
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    // TODO: Implement forgot password logic
    console.log('Forgot password clicked');
  };

  return (
    <LoginFormTemplate
      title={t('title')}
      subtitle={t('subtitle')}
      emailLabel={t('email')}
      passwordLabel={t('password')}
      submitLabel={t('submit')}
      forgotPasswordLabel={t('forgotPassword')}
      email={email}
      password={password}
      isLoading={isLoading}
      error={error}
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
      onSubmit={handleSubmit}
      onForgotPasswordClick={handleForgotPassword}
    />
  );
};
