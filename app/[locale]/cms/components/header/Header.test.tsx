import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { Header } from './Header';
import * as CmsHeaderModule from '@/template/app/cms/components/header/CmsHeaderTemplate';

vi.mock('next-auth/react', () => ({
  useSession: vi.fn(() => ({
    data: {
      user: {
        email: 'test@example.com',
      },
    },
    status: 'authenticated',
  })),
}));

vi.mock('@/template/app/cms/components/header/CmsHeaderTemplate', () => ({
  CmsHeaderTemplate: vi.fn(
    ({
      storeName,
      userEmail,
      userInitial,
    }: {
      storeName: string;
      userEmail?: string | null;
      userInitial: string;
    }) => (
      <div data-testid="cms-header-template">
        {storeName} - {userEmail} - {userInitial}
      </div>
    )
  ),
}));

vi.mock('@/config/config', () => ({
  storeConfig: {
    name: 'Test Store Name',
  },
}));

describe('Header', () => {
  it('should render CmsHeaderTemplate with store name from config', () => {
    render(<Header />);

    expect(CmsHeaderModule.CmsHeaderTemplate).toHaveBeenCalledWith(
      expect.objectContaining({
        storeName: 'Test Store Name',
        userEmail: 'test@example.com',
        userInitial: 'T',
      }),
      undefined
    );
  });

  it('should pass correct store name to template', () => {
    const { getByTestId } = render(<Header />);

    const template = getByTestId('cms-header-template');
    expect(template).toHaveTextContent('Test Store Name');
  });
});
