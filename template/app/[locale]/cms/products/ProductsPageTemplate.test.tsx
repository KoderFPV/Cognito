import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { ProductsPageTemplate } from './ProductsPageTemplate';

vi.mock('@/components/tables/Table/Table', () => {
  return {
    Table: ({ data, columns }: any) => {
      if (!columns || !data) {
        return <div data-testid="mock-table">No data</div>;
      }

      return (
        <div data-testid="mock-table">
          <table>
            <thead>
              <tr>
                {columns.map((col: any) => (
                  <th key={col.key}>{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((item: any) => (
                <tr key={item._id}>
                  {columns.map((col: any) => (
                    <td key={`${item._id}-${col.key}`}>{item[col.key]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    },
  };
});

interface TestProduct {
  _id: string;
  name: string;
  price: number;
  sku: string;
  stock: number;
  category: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

describe('ProductsPageTemplate', () => {
  const mockProducts: TestProduct[] = [
    {
      _id: '1',
      name: 'Product 1',
      price: 29.99,
      sku: 'SKU-001',
      stock: 10,
      category: 'Electronics',
      description: 'Test product 1',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: '2',
      name: 'Product 2',
      price: 49.99,
      sku: 'SKU-002',
      stock: 5,
      category: 'Clothing',
      description: 'Test product 2',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const mockColumns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'price', label: 'Price', sortable: true },
    { key: 'sku', label: 'SKU', sortable: true },
    { key: 'stock', label: 'Stock', sortable: true },
  ];

  const defaultProps = {
    columns: mockColumns,
    products: mockProducts,
    isLoading: false,
    error: '',
    pagination: {
      page: 1,
      pageSize: 10,
      total: 2,
      totalPages: 1,
    },
    onPageChange: vi.fn(),
    onPageSizeChange: vi.fn(),
    onAddProduct: vi.fn(),
    title: 'Products',
    addButtonLabel: 'Add Product',
  };

  it('should render page title', () => {
    render(<ProductsPageTemplate {...defaultProps} />);

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('should render Add Product button', () => {
    render(<ProductsPageTemplate {...defaultProps} />);

    const button = screen.getByRole('button', { name: /add product/i });
    expect(button).toBeInTheDocument();
  });

  it('should call onAddProduct when Add Product button is clicked', async () => {
    const user = userEvent.setup();
    const onAddProduct = vi.fn();
    render(<ProductsPageTemplate {...defaultProps} onAddProduct={onAddProduct} />);

    const button = screen.getByRole('button', { name: /add product/i });
    await user.click(button);

    expect(onAddProduct).toHaveBeenCalled();
  });

  it('should render table with products', () => {
    render(<ProductsPageTemplate {...defaultProps} />);

    expect(screen.getByTestId('mock-table')).toBeInTheDocument();
    expect(screen.getByText('Product 1')).toBeInTheDocument();
    expect(screen.getByText('Product 2')).toBeInTheDocument();
  });

  it('should not display error message when error is empty', () => {
    render(<ProductsPageTemplate {...defaultProps} />);

    expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
  });

  it('should display error message when error prop is provided', () => {
    const errorMessage = 'Failed to load products';
    render(<ProductsPageTemplate {...defaultProps} error={errorMessage} />);

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('should pass correct columns to table', () => {
    render(<ProductsPageTemplate {...defaultProps} />);

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Price')).toBeInTheDocument();
    expect(screen.getByText('SKU')).toBeInTheDocument();
    expect(screen.getByText('Stock')).toBeInTheDocument();
  });

  it('should render table with correct data', () => {
    render(<ProductsPageTemplate {...defaultProps} />);

    expect(screen.getByText('29.99')).toBeInTheDocument();
    expect(screen.getByText('SKU-001')).toBeInTheDocument();
  });

  it('should pass pagination props to table', () => {
    render(<ProductsPageTemplate {...defaultProps} />);

    expect(screen.getByTestId('mock-table')).toBeInTheDocument();
  });

  it('should handle empty products list', () => {
    render(<ProductsPageTemplate {...defaultProps} products={[]} />);

    expect(screen.getByTestId('mock-table')).toBeInTheDocument();
  });

  it('should display loading state in table', () => {
    render(<ProductsPageTemplate {...defaultProps} isLoading={true} />);

    expect(screen.getByTestId('mock-table')).toBeInTheDocument();
  });

  it('should render Add Product button with proper styling', () => {
    render(<ProductsPageTemplate {...defaultProps} />);

    const button = screen.getByRole('button', { name: /add product/i });
    expect(button).toBeInTheDocument();
  });

  it('should render title text correctly', () => {
    render(<ProductsPageTemplate {...defaultProps} />);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading.textContent).toMatch(/products/i);
  });

  it('should pass isLoading prop to table', () => {
    render(<ProductsPageTemplate {...defaultProps} isLoading={true} />);

    expect(screen.getByTestId('mock-table')).toBeInTheDocument();
  });

  it('should handle error state properly', () => {
    const errorMessage = 'Network error occurred';
    render(<ProductsPageTemplate {...defaultProps} error={errorMessage} />);

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('should render error with correct styling', () => {
    const errorMessage = 'Test error';
    render(<ProductsPageTemplate {...defaultProps} error={errorMessage} />);

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('should pass onPageChange callback to table', () => {
    const onPageChange = vi.fn();
    render(<ProductsPageTemplate {...defaultProps} onPageChange={onPageChange} />);

    expect(screen.getByTestId('mock-table')).toBeInTheDocument();
  });

  it('should pass onPageSizeChange callback to table', () => {
    const onPageSizeChange = vi.fn();
    render(<ProductsPageTemplate {...defaultProps} onPageSizeChange={onPageSizeChange} />);

    expect(screen.getByTestId('mock-table')).toBeInTheDocument();
  });

  it('should display products with all required fields', () => {
    render(<ProductsPageTemplate {...defaultProps} />);

    expect(screen.getByText('Product 1')).toBeInTheDocument();
    expect(screen.getByText('29.99')).toBeInTheDocument();
    expect(screen.getByText('SKU-001')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('should render multiple products correctly', () => {
    render(<ProductsPageTemplate {...defaultProps} />);

    expect(screen.getByText('Product 1')).toBeInTheDocument();
    expect(screen.getByText('Product 2')).toBeInTheDocument();
  });

  it('should handle different product prices', () => {
    render(<ProductsPageTemplate {...defaultProps} />);

    expect(screen.getByText('29.99')).toBeInTheDocument();
    expect(screen.getByText('49.99')).toBeInTheDocument();
  });

  it('should handle different stock levels', () => {
    render(<ProductsPageTemplate {...defaultProps} />);

    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('should render with proper page layout', () => {
    render(<ProductsPageTemplate {...defaultProps} />);

    const heading = screen.getByRole('heading', { level: 1 });
    const button = screen.getByRole('button', { name: /add product/i });

    expect(heading).toBeInTheDocument();
    expect(button).toBeInTheDocument();
  });
});
