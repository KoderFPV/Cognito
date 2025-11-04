'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { CmsHeaderTemplate } from '@/template/app/cms/components/header/CmsHeaderTemplate';
import { storeConfig } from '@/config/config';
import { useDropdown } from '@/hooks/useDropdown';

export const Header = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations('common');
  const dropdown = useDropdown();

  const getUserInitial = (email?: string | null) => {
    if (!email) {
      return '?';
    }
    return email.charAt(0).toUpperCase();
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push(`/${locale}`);
  };

  return (
    <CmsHeaderTemplate
      storeName={storeConfig.name}
      userEmail={session?.user?.email}
      userInitial={getUserInitial(session?.user?.email)}
      isDropdownOpen={dropdown.isOpen}
      onAvatarClick={dropdown.toggle}
      onLogout={handleLogout}
      dropdownRef={dropdown.dropdownRef}
      logoutText={t('logout')}
    />
  );
};
