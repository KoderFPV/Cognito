import { describe, it, expect, vi } from 'vitest';
import { formatProductDetails, IProductTranslations } from './productDetailsService';
import { IProduct, IProductAttribute } from '@/domain/product';

vi.mock('@/services/logger/graphLogger', () => ({
  graphLogger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe('productDetailsService', () => {
  const mockProduct: IProduct = {
    _id: 'test-id-1',
    name: 'Gaming Laptop Pro X1',
    description: 'High-performance gaming laptop with RTX 4080, 32GB RAM, 1TB SSD.',
    price: 4999.99,
    sku: 'LAPTOP-GAMING-001',
    stock: 15,
    category: 'Laptops',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    deleted: false,
    attributes: [
      { name: 'RAM', value: '32', unit: 'GB' },
      { name: 'GPU', value: 'RTX 4080' },
    ],
  };

  const translations: IProductTranslations = {
    notFound: 'Not found',
    noReference: 'No reference',
    noSearchResults: 'No search results',
    productDetails: 'Product Details',
    price: 'Price',
    category: 'Category',
    inStock: 'In stock',
    outOfStock: 'Out of stock',
    specifications: 'Specifications',
    description: 'Description',
    error: 'Error',
  };

  describe('formatProductDetails', () => {
    it('should format product with attributes', () => {
      const attributes: IProductAttribute[] = [
        { name: 'RAM', value: '32', unit: 'GB' },
        { name: 'GPU', value: 'RTX 4080' },
      ];

      const result = formatProductDetails(mockProduct, attributes, translations);

      expect(result).toContain('## Gaming Laptop Pro X1');
      expect(result).toContain('**Price:** 4999.99 zł');
      expect(result).toContain('**Category:** Laptops');
      expect(result).toContain('**In stock**');
      expect(result).toContain('### Specifications');
      expect(result).toContain('- **RAM:** 32 GB');
      expect(result).toContain('- **GPU:** RTX 4080');
      expect(result).toContain('### Description');
      expect(result).toContain('High-performance gaming laptop');
    });

    it('should format product without attributes', () => {
      const result = formatProductDetails(mockProduct, [], translations);

      expect(result).toContain('## Gaming Laptop Pro X1');
      expect(result).toContain('**Price:** 4999.99 zł');
      expect(result).not.toContain('### Specifications');
      expect(result).toContain('### Description');
    });

    it('should show out of stock for zero stock', () => {
      const outOfStockProduct = { ...mockProduct, stock: 0 };
      const result = formatProductDetails(outOfStockProduct, [], translations);

      expect(result).toContain('**Out of stock**');
    });

    it('should include all required fields', () => {
      const result = formatProductDetails(mockProduct, [], translations);

      expect(result).toContain(mockProduct.name);
      expect(result).toContain(mockProduct.price.toFixed(2));
      expect(result).toContain(mockProduct.category);
      expect(result).toContain(mockProduct.description);
    });
  });
});
