import { Header } from './components/header/Header';
import { ReactNode } from 'react';

export interface ICmsLayoutProps {
  children: ReactNode;
}

export default function CmsLayout({ children }: ICmsLayoutProps) {
  return (
    <>
      <Header />
      <main>{children}</main>
    </>
  );
}
