/**
 * @vitest-environment node
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WeaviateClient } from 'weaviate-client';
import {
  addProductToWeaviate,
  deleteProductFromWeaviate,
} from './weaviateProductsModel';
import { IProduct } from '@/domain/product';

describe('weaviateProductsModel', () => {
  const mockProduct: IProduct = {
    _id: '507f1f77bcf86cd799439011',
    name: 'Test Product',
    description: 'Test product description',
    price: 99.99,
    sku: 'TEST-SKU-001',
    stock: 10,
    imageUrl: 'https://example.com/image.jpg',
    category: 'Electronics',
    isActive: true,
    createdAt: new Date('2025-01-01T00:00:00.000Z'),
    updatedAt: new Date('2025-01-01T00:00:00.000Z'),
    deleted: false,
  };

  const mockFilter: any = {
    equal: vi.fn(),
  };
  mockFilter.equal.mockReturnValue(mockFilter);

  const mockCollection = {
    data: {
      insert: vi.fn(),
      deleteMany: vi.fn(),
    },
    filter: {
      byProperty: vi.fn().mockReturnValue(mockFilter),
    },
  };

  const mockClient = {
    collections: {
      get: vi.fn().mockReturnValue(mockCollection),
      exists: vi.fn(),
      create: vi.fn(),
    },
  } as unknown as WeaviateClient;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('addProductToWeaviate', () => {
    it('should add product to Weaviate collection', async () => {
      await addProductToWeaviate(mockClient, mockProduct);

      expect(mockCollection.data.insert).toHaveBeenCalledWith({
        id: mockProduct._id,
        name: mockProduct.name,
        description: mockProduct.description,
        category: mockProduct.category,
        price: mockProduct.price,
        sku: mockProduct.sku,
        stock: mockProduct.stock,
        imageUrl: mockProduct.imageUrl,
      });
    });

    it('should get correct collection name', async () => {
      await addProductToWeaviate(mockClient, mockProduct);

      expect(vi.mocked(mockClient.collections.get)).toHaveBeenCalledWith(
        'Product'
      );
    });

    it('should handle product without imageUrl', async () => {
      const productWithoutImage = { ...mockProduct, imageUrl: undefined };

      await addProductToWeaviate(mockClient, productWithoutImage);

      expect(mockCollection.data.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          id: productWithoutImage._id,
          name: productWithoutImage.name,
          imageUrl: undefined,
        })
      );
    });

    it('should throw error when insert fails', async () => {
      mockCollection.data.insert.mockRejectedValueOnce(
        new Error('Insert failed')
      );

      await expect(addProductToWeaviate(mockClient, mockProduct)).rejects.toThrow(
        'Insert failed'
      );
    });

    it('should map product fields correctly', async () => {
      const customProduct: IProduct = {
        ...mockProduct,
        name: 'Custom Product',
        price: 49.99,
        stock: 5,
      };

      await addProductToWeaviate(mockClient, customProduct);

      expect(mockCollection.data.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Custom Product',
          price: 49.99,
          stock: 5,
        })
      );
    });
  });

  describe('deleteProductFromWeaviate', () => {
    it('should delete product from Weaviate collection', async () => {
      await deleteProductFromWeaviate(mockClient, mockProduct._id);

      expect(vi.mocked(mockCollection.filter.byProperty)).toHaveBeenCalledWith(
        'id'
      );
      expect(vi.mocked(mockFilter.equal)).toHaveBeenCalledWith(
        mockProduct._id
      );
      expect(vi.mocked(mockCollection.data.deleteMany)).toHaveBeenCalledWith(
        mockFilter
      );
    });

    it('should get correct collection name', async () => {
      await deleteProductFromWeaviate(mockClient, mockProduct._id);

      expect(vi.mocked(mockClient.collections.get)).toHaveBeenCalledWith(
        'Product'
      );
    });

    it('should delete by product ID', async () => {
      const customId = 'custom-product-id-123';

      await deleteProductFromWeaviate(mockClient, customId);

      expect(vi.mocked(mockFilter.equal)).toHaveBeenCalledWith(customId);
    });

    it('should throw error when delete fails', async () => {
      mockCollection.data.deleteMany.mockRejectedValueOnce(
        new Error('Delete failed')
      );

      await expect(
        deleteProductFromWeaviate(mockClient, mockProduct._id)
      ).rejects.toThrow('Delete failed');
    });
  });
});
