import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CmsHeaderTemplate } from './CmsHeaderTemplate';

describe('CmsHeaderTemplate', () => {
  it('should render store name', () => {
    render(<CmsHeaderTemplate storeName="Test Store" />);

    expect(screen.getByText('Test Store')).toBeInTheDocument();
  });

  it('should render header element', () => {
    const { container } = render(<CmsHeaderTemplate storeName="Test Store" />);

    const header = container.querySelector('header');
    expect(header).toBeInTheDocument();
  });

  it('should render h1 with store name', () => {
    render(<CmsHeaderTemplate storeName="My E-commerce" />);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('My E-commerce');
  });
});
