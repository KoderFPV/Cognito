import { useTranslations } from 'next-intl';

export default function CmsHomePage() {
  const t = useTranslations('cms.home');

  return (
    <div>
      <h1>{t('welcome')}</h1>
    </div>
  );
}
