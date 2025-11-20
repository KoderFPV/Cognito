/**
 * @vitest-environment node
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  createProduct,
  deleteProduct,
} from './productService';
import { IProduct } from '@/domain/product';

vi.mock('@/clients/weaviate/weaviate');
vi.mock('@/clients/mongodb/mongodb');
vi.mock('@/models/products/productsModel');
vi.mock('@/models/products/weaviateProductsModel');
vi.mock('@/services/product/productValidation.service');

import { connectToWeaviate } from '@/clients/weaviate/weaviate';
import { connectToMongo } from '@/clients/mongodb/mongodb';
import {
  createProduct as createProductMongo,
  deleteProduct as deleteProductMongo,
  getProductById,
} from '@/models/products/productsModel';
import {
  addProductToWeaviate,
  deleteProductFromWeaviate,
} from '@/models/products/weaviateProductsModel';
import { validateProductData } from '@/services/product/productValidation.service';

describe('productService', () => {
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

  const mockDb = {};
  const mockWeaviateClient = {};
  const locale = 'en';

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(connectToMongo).mockResolvedValue(mockDb as any);
    vi.mocked(connectToWeaviate).mockResolvedValue(mockWeaviateClient as any);
    vi.mocked(validateProductData).mockResolvedValue({
      name: 'Test Product',
      description: 'Test product description',
      price: 99.99,
      sku: 'TEST-SKU-001',
      stock: 10,
      imageUrl: 'https://example.com/image.jpg',
      category: 'Electronics',
      isActive: true,
    } as any);
    vi.mocked(createProductMongo).mockResolvedValue(mockProduct);
    vi.mocked(addProductToWeaviate).mockResolvedValue(undefined);
    vi.mocked(deleteProductMongo).mockResolvedValue(true);
    vi.mocked(deleteProductFromWeaviate).mockResolvedValue(undefined);
    vi.mocked(getProductById).mockResolvedValue(mockProduct);
  });

  describe('createProduct', () => {
    it('should create product in both MongoDB and Weaviate', async () => {
      const productData = {
        name: 'Test Product',
        description: 'Test product description',
        price: 99.99,
        sku: 'TEST-SKU-001',
        stock: 10,
        imageUrl: 'https://example.com/image.jpg',
        category: 'Electronics',
        isActive: true,
      };

      const result = await createProduct(productData, locale);

      expect(vi.mocked(validateProductData)).toHaveBeenCalledWith(
        productData,
        locale
      );
      expect(vi.mocked(createProduct)).toHaveBeenCalled();
      expect(vi.mocked(addProductToWeaviate)).toHaveBeenCalledWith(
        mockWeaviateClient,
        mockProduct
      );
      expect(result).toEqual(mockProduct);
    });

    it('should rollback MongoDB insert if Weaviate fails', async () => {
      vi.mocked(addProductToWeaviate).mockRejectedValueOnce(
        new Error('Weaviate connection failed')
      );

      const productData = {
        name: 'Test Product',
        description: 'Test product description',
        price: 99.99,
        sku: 'TEST-SKU-001',
        stock: 10,
        category: 'Electronics',
        isActive: true,
      };

      await expect(
        createProduct(productData, locale)
      ).rejects.toThrow('Failed to sync product to Weaviate');

      expect(vi.mocked(deleteProductMongo)).toHaveBeenCalledWith(
        mockDb,
        mockProduct._id
      );
    });

    it('should throw error when validation fails', async () => {
      vi.mocked(validateProductData).mockRejectedValueOnce(
        new Error('Validation failed')
      );

      await expect(
        createProduct({}, locale)
      ).rejects.toThrow('Validation failed');

      expect(vi.mocked(createProductMongo)).not.toHaveBeenCalled();
    });

    it('should throw error with Weaviate error message when sync fails', async () => {
      const weaviateError = new Error('Specific Weaviate error message');
      vi.mocked(addProductToWeaviate).mockRejectedValueOnce(weaviateError);

      await expect(
        createProduct({} as any, locale)
      ).rejects.toThrow('Failed to sync product to Weaviate: Specific Weaviate error message');
    });
  });

  describe('deleteProduct', () => {
    it('should delete product from both MongoDB and Weaviate', async () => {
      const result = await deleteProduct(mockProduct._id, locale);

      expect(vi.mocked(getProductById)).toHaveBeenCalledWith(mockDb, mockProduct._id);
      expect(vi.mocked(deleteProduct)).toHaveBeenCalledWith(mockDb, mockProduct._id);
      expect(vi.mocked(deleteProductFromWeaviate)).toHaveBeenCalledWith(
        mockWeaviateClient,
        mockProduct._id
      );
      expect(result).toBe(true);
    });

    it('should return false when product not found', async () => {
      vi.mocked(getProductById).mockResolvedValueOnce(null);

      const result = await deleteProduct(mockProduct._id, locale);

      expect(result).toBe(false);
      expect(vi.mocked(deleteProduct)).not.toHaveBeenCalled();
    });

    it('should return false when MongoDB delete fails', async () => {
      vi.mocked(deleteProduct).mockResolvedValueOnce(false);

      const result = await deleteProduct(mockProduct._id, locale);

      expect(result).toBe(false);
    });

    it('should restore MongoDB document if Weaviate deletion fails', async () => {
      vi.mocked(deleteProductFromWeaviate).mockRejectedValueOnce(
        new Error('Weaviate connection failed')
      );

      await expect(
        deleteProduct(mockProduct._id, locale)
      ).rejects.toThrow('Failed to sync product deletion to Weaviate');

      expect(vi.mocked(connectToMongo)).toHaveBeenCalledTimes(2);
    });

    it('should throw error with Weaviate error message when deletion sync fails', async () => {
      const weaviateError = new Error('Specific Weaviate error');
      vi.mocked(deleteProductFromWeaviate).mockRejectedValueOnce(weaviateError);

      await expect(
        deleteProduct(mockProduct._id, locale)
      ).rejects.toThrow(
        'Failed to sync product deletion to Weaviate: Specific Weaviate error'
      );
    });
  });
});
