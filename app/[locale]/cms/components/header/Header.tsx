'use client';

import { useSession } from 'next-auth/react';
import { CmsHeaderTemplate } from '@/template/app/cms/components/header/CmsHeaderTemplate';
import { storeConfig } from '@/config/config';

export const Header = () => {
  const { data: session } = useSession();

  const getUserInitial = (email?: string | null) => {
    if (!email) {
      return '?';
    }
    return email.charAt(0).toUpperCase();
  };

  return (
    <CmsHeaderTemplate
      storeName={storeConfig.name}
      userEmail={session?.user?.email}
      userInitial={getUserInitial(session?.user?.email)}
    />
  );
};
