import React from 'react';
import { render, screen } from '@testing-library/react';
import { ProductsPageTemplate } from './ProductsPageTemplate';

jest.mock('@/components/tables/Table/Table', () => {
  return {
    Table: ({ data, columns }: any) => (
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
    ),
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

  const defaultProps = {
    products: mockProducts,
    isLoading: false,
    error: '',
    pagination: {
      page: 1,
      pageSize: 10,
      total: 2,
      totalPages: 1,
    },
    onPageChange: jest.fn(),
    onPageSizeChange: jest.fn(),
    onAddProduct: jest.fn(),
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

  it('should call onAddProduct when Add Product button is clicked', () => {
    const onAddProduct = jest.fn();
    render(<ProductsPageTemplate {...defaultProps} onAddProduct={onAddProduct} />);

    const button = screen.getByRole('button', { name: /add product/i });
    button.click();

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
    expect(button).toHaveClass('addButton');
  });

  it('should have proper container structure', () => {
    const { container } = render(<ProductsPageTemplate {...defaultProps} />);

    expect(container.querySelector('.container')).toBeInTheDocument();
  });

  it('should have header section with flexbox layout', () => {
    const { container } = render(<ProductsPageTemplate {...defaultProps} />);

    expect(container.querySelector('.header')).toBeInTheDocument();
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
    const { container } = render(<ProductsPageTemplate {...defaultProps} error={errorMessage} />);

    const errorElement = container.querySelector('.error');
    expect(errorElement).toHaveTextContent(errorMessage);
  });

  it('should render error with correct styling', () => {
    const errorMessage = 'Test error';
    const { container } = render(<ProductsPageTemplate {...defaultProps} error={errorMessage} />);

    const errorElement = container.querySelector('.error');
    expect(errorElement).toBeInTheDocument();
  });

  it('should pass onPageChange callback to table', () => {
    const onPageChange = jest.fn();
    render(<ProductsPageTemplate {...defaultProps} onPageChange={onPageChange} />);

    expect(screen.getByTestId('mock-table')).toBeInTheDocument();
  });

  it('should pass onPageSizeChange callback to table', () => {
    const onPageSizeChange = jest.fn();
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
    const { container } = render(<ProductsPageTemplate {...defaultProps} />);

    const header = container.querySelector('.header');
    const title = container.querySelector('.title');

    expect(header).toBeInTheDocument();
    expect(title).toBeInTheDocument();
  });
});
