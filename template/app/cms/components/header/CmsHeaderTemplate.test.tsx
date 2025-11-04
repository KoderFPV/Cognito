import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CmsHeaderTemplate } from './CmsHeaderTemplate';

describe('CmsHeaderTemplate', () => {
  it('should render store name', () => {
    render(<CmsHeaderTemplate storeName="Test Store" userInitial="?" />);

    expect(screen.getByText('Test Store')).toBeInTheDocument();
  });

  it('should render header element', () => {
    const { container } = render(
      <CmsHeaderTemplate storeName="Test Store" userInitial="?" />
    );

    const header = container.querySelector('header');
    expect(header).toBeInTheDocument();
  });

  it('should render h1 with store name', () => {
    render(<CmsHeaderTemplate storeName="My E-commerce" userInitial="?" />);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('My E-commerce');
  });

  it('should render user avatar when email is provided', () => {
    render(
      <CmsHeaderTemplate
        storeName="Test Store"
        userEmail="test@example.com"
        userInitial="T"
      />
    );

    expect(screen.getByText('T')).toBeInTheDocument();
    expect(screen.getByTitle('test@example.com')).toBeInTheDocument();
  });

  it('should not render user avatar when email is not provided', () => {
    render(<CmsHeaderTemplate storeName="Test Store" userInitial="?" />);

    expect(screen.queryByText('?')).not.toBeInTheDocument();
  });
});
