'use client';

import { CmsHeaderTemplate } from '@/template/app/cms/components/header/CmsHeaderTemplate';
import { storeConfig } from '@/config/config';

export const Header = () => {
  return <CmsHeaderTemplate storeName={storeConfig.name} />;
};
