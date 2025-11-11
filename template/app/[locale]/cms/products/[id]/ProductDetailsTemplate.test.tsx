import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProductDetailsTemplate } from './ProductDetailsTemplate';
import { IProduct } from '@/domain/product';

vi.mock('next-intl', async (importOriginal) => {
  const actual = (await importOriginal()) as any;
  return {
    ...actual,
    useTranslations: () => (key: string) => {
      const translations: Record<string, string> = {
        back: 'Back',
        loading: 'Loading product details...',
        notFound: 'Product not found',
        noImage: 'No image available',
        description: 'Description',
        price: 'Price',
        sku: 'SKU',
        stock: 'Stock',
        category: 'Category',
        status: 'Status',
        active: 'Active',
        inactive: 'Inactive',
        deleted: 'Deleted',
        created: 'Created',
        updated: 'Updated',
      };
      return translations[key] || key;
    },
  };
});

const mockProduct: IProduct = {
  _id: '507f1f77bcf86cd799439011',
  name: 'Test Product',
  description: 'This is a test product',
  price: 99.99,
  sku: 'TEST-SKU-001',
  stock: 10,
  imageUrl: 'https://example.com/image.jpg',
  category: 'Electronics',
  isActive: true,
  createdAt: new Date('2025-01-01T10:00:00Z'),
  updatedAt: new Date('2025-01-02T15:30:00Z'),
  deleted: false,
};

const renderTemplate = (props: any) => {
  return render(<ProductDetailsTemplate {...props} />);
};

describe('ProductDetailsTemplate', () => {
  describe('Error State', () => {
    it('should display error message when product is null and error is provided', () => {
      const onBack = vi.fn();
      renderTemplate({
        product: null,
        error: 'Failed to load product',
        onBack,
      });

      expect(screen.getByText('Failed to load product')).toBeInTheDocument();
    });

    it('should display notFound message when product is null and no error', () => {
      const onBack = vi.fn();
      renderTemplate({
        product: null,
        error: null,
        onBack,
      });

      expect(screen.getByText('Product not found')).toBeInTheDocument();
    });

    it('should display error message even when product exists if error is provided', () => {
      const onBack = vi.fn();
      renderTemplate({
        product: mockProduct,
        error: 'Custom error message',
        onBack,
      });

      expect(screen.getByText('Custom error message')).toBeInTheDocument();
    });

    it('should display back button in error state', () => {
      const onBack = vi.fn();
      renderTemplate({
        product: null,
        error: 'Product not found',
        onBack,
      });

      expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
    });
  });

  describe('Product Details Display', () => {
    it('should display product name', () => {
      const onBack = vi.fn();
      renderTemplate({
        product: mockProduct,
        error: null,
        onBack,
      });

      expect(screen.getByRole('heading', { name: 'Test Product' })).toBeInTheDocument();
    });

    it('should display product description', () => {
      const onBack = vi.fn();
      renderTemplate({
        product: mockProduct,
        error: null,
        onBack,
      });

      expect(screen.getByText('This is a test product')).toBeInTheDocument();
    });

    it('should display price with currency format', () => {
      const onBack = vi.fn();
      renderTemplate({
        product: mockProduct,
        error: null,
        onBack,
      });

      expect(screen.getByText(/\$99\.99/)).toBeInTheDocument();
    });

    it('should display SKU', () => {
      const onBack = vi.fn();
      renderTemplate({
        product: mockProduct,
        error: null,
        onBack,
      });

      expect(screen.getByText('TEST-SKU-001')).toBeInTheDocument();
    });

    it('should display stock quantity', () => {
      const onBack = vi.fn();
      renderTemplate({
        product: mockProduct,
        error: null,
        onBack,
      });

      expect(screen.getByText('10')).toBeInTheDocument();
    });

    it('should display category', () => {
      const onBack = vi.fn();
      renderTemplate({
        product: mockProduct,
        error: null,
        onBack,
      });

      expect(screen.getByText('Electronics')).toBeInTheDocument();
    });

    it('should display "Active" status for active products', () => {
      const onBack = vi.fn();
      renderTemplate({
        product: mockProduct,
        error: null,
        onBack,
      });

      expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('should display "Inactive" status for inactive products', () => {
      const onBack = vi.fn();
      const inactiveProduct = { ...mockProduct, isActive: false };
      renderTemplate({
        product: inactiveProduct,
        error: null,
        onBack,
      });

      expect(screen.getByText('Inactive')).toBeInTheDocument();
    });

    it('should display timestamps', () => {
      const onBack = vi.fn();
      renderTemplate({
        product: mockProduct,
        error: null,
        onBack,
      });

      expect(screen.getByText(/Created/)).toBeInTheDocument();
      expect(screen.getByText(/Updated/)).toBeInTheDocument();
    });
  });

  describe('Image Display', () => {
    it('should display product image when imageUrl is provided', () => {
      const onBack = vi.fn();
      renderTemplate({
        product: mockProduct,
        error: null,
        onBack,
      });

      const img = screen.getByRole('img', { name: 'Test Product' });
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', 'https://example.com/image.jpg');
    });

    it('should display placeholder when imageUrl is not provided', () => {
      const onBack = vi.fn();
      const productWithoutImage = { ...mockProduct, imageUrl: undefined };
      renderTemplate({
        product: productWithoutImage,
        error: null,
        onBack,
      });

      expect(screen.getByText('No image available')).toBeInTheDocument();
    });
  });

  describe('Deleted Product', () => {
    it('should display deleted status for deleted products', () => {
      const onBack = vi.fn();
      const deletedProduct = { ...mockProduct, deleted: true };
      renderTemplate({
        product: deletedProduct,
        error: null,
        onBack,
      });

      expect(screen.getByText('Deleted')).toBeInTheDocument();
    });

    it('should still display all product information for deleted products', () => {
      const onBack = vi.fn();
      const deletedProduct = { ...mockProduct, deleted: true };
      renderTemplate({
        product: deletedProduct,
        error: null,
        onBack,
      });

      expect(screen.getByText('Test Product')).toBeInTheDocument();
      expect(screen.getByText(/\$99\.99/)).toBeInTheDocument();
      expect(screen.getByText('Deleted')).toBeInTheDocument();
    });
  });

  describe('Back Button', () => {
    it('should render back button', () => {
      const onBack = vi.fn();
      renderTemplate({
        product: mockProduct,
        error: null,
        onBack,
      });

      expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
    });

    it('should call onBack when back button is clicked', async () => {
      const onBack = vi.fn();
      const user = userEvent.setup();
      renderTemplate({
        product: mockProduct,
        error: null,
        onBack,
      });

      const backButton = screen.getByRole('button', { name: /back/i });
      await user.click(backButton);

      expect(onBack).toHaveBeenCalledOnce();
    });

    it('should have back button in error state', () => {
      const onBack = vi.fn();
      renderTemplate({
        product: null,
        error: 'Not found',
        onBack,
      });

      const backButton = screen.getByRole('button', { name: /back/i });
      expect(backButton).toBeInTheDocument();
    });
  });

  describe('Price Formatting', () => {
    it('should format price with 2 decimal places', () => {
      const onBack = vi.fn();
      const productWithDecimal = { ...mockProduct, price: 19.5 };
      renderTemplate({
        product: productWithDecimal,
        error: null,
        onBack,
      });

      expect(screen.getByText(/\$19\.50/)).toBeInTheDocument();
    });

    it('should handle zero price', () => {
      const onBack = vi.fn();
      const freeProduct = { ...mockProduct, price: 0 };
      renderTemplate({
        product: freeProduct,
        error: null,
        onBack,
      });

      expect(screen.getByText(/\$0\.00/)).toBeInTheDocument();
    });

    it('should handle large prices', () => {
      const onBack = vi.fn();
      const expensiveProduct = { ...mockProduct, price: 9999.99 };
      renderTemplate({
        product: expensiveProduct,
        error: null,
        onBack,
      });

      expect(screen.getByText(/\$9999\.99/)).toBeInTheDocument();
    });
  });

  describe('Stock Display', () => {
    it('should display zero stock', () => {
      const onBack = vi.fn();
      const outOfStockProduct = { ...mockProduct, stock: 0 };
      renderTemplate({
        product: outOfStockProduct,
        error: null,
        onBack,
      });

      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('should display large stock numbers', () => {
      const onBack = vi.fn();
      const stockyProduct = { ...mockProduct, stock: 9999 };
      renderTemplate({
        product: stockyProduct,
        error: null,
        onBack,
      });

      expect(screen.getByText('9999')).toBeInTheDocument();
    });
  });

  describe('All Field Labels', () => {
    it('should display all field labels', () => {
      const onBack = vi.fn();
      renderTemplate({
        product: mockProduct,
        error: null,
        onBack,
      });

      expect(screen.getByText(/Description:/)).toBeInTheDocument();
      expect(screen.getByText(/Price:/)).toBeInTheDocument();
      expect(screen.getByText(/SKU:/)).toBeInTheDocument();
      expect(screen.getByText(/Stock:/)).toBeInTheDocument();
      expect(screen.getByText(/Category:/)).toBeInTheDocument();
      expect(screen.getByText(/Status:/)).toBeInTheDocument();
      expect(screen.getByText(/Created:/)).toBeInTheDocument();
      expect(screen.getByText(/Updated:/)).toBeInTheDocument();
    });
  });
});
