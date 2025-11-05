import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CmsHeaderTemplate } from './CmsHeaderTemplate';

const mockDropdownRef = { current: null };
const mockOnAvatarClick = vi.fn();
const mockOnLogout = vi.fn();

describe('CmsHeaderTemplate', () => {
  it('should render store name', () => {
    render(
      <CmsHeaderTemplate
        storeName="Test Store"
        userInitial="?"
        isDropdownOpen={false}
        onAvatarClick={mockOnAvatarClick}
        onLogout={mockOnLogout}
        dropdownRef={mockDropdownRef}
        logoutText="Logout"
      />
    );

    expect(screen.getByText('Test Store')).toBeInTheDocument();
  });

  it('should render header element', () => {
    const { container } = render(
      <CmsHeaderTemplate
        storeName="Test Store"
        userInitial="?"
        isDropdownOpen={false}
        onAvatarClick={mockOnAvatarClick}
        onLogout={mockOnLogout}
        dropdownRef={mockDropdownRef}
        logoutText="Logout"
      />
    );

    const header = container.querySelector('header');
    expect(header).toBeInTheDocument();
  });

  it('should render h1 with store name', () => {
    render(
      <CmsHeaderTemplate
        storeName="My E-commerce"
        userInitial="?"
        isDropdownOpen={false}
        onAvatarClick={mockOnAvatarClick}
        onLogout={mockOnLogout}
        dropdownRef={mockDropdownRef}
        logoutText="Logout"
      />
    );

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('My E-commerce');
  });

  it('should render user avatar when email is provided', () => {
    render(
      <CmsHeaderTemplate
        storeName="Test Store"
        userEmail="test@example.com"
        userInitial="T"
        isDropdownOpen={false}
        onAvatarClick={mockOnAvatarClick}
        onLogout={mockOnLogout}
        dropdownRef={mockDropdownRef}
        logoutText="Logout"
      />
    );

    expect(screen.getByText('T')).toBeInTheDocument();
    expect(screen.getByTitle('test@example.com')).toBeInTheDocument();
  });

  it('should not render user avatar when email is not provided', () => {
    render(
      <CmsHeaderTemplate
        storeName="Test Store"
        userInitial="?"
        isDropdownOpen={false}
        onAvatarClick={mockOnAvatarClick}
        onLogout={mockOnLogout}
        dropdownRef={mockDropdownRef}
        logoutText="Logout"
      />
    );

    expect(screen.queryByText('?')).not.toBeInTheDocument();
  });
});
