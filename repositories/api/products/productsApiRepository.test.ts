import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createProductViaApi, deleteProductViaApi, IProductCreationResponse, IProductDeletionResponse } from './productsApiRepository';

describe('productsApiRepository', () => {
  const mockFetch = vi.fn();
  global.fetch = mockFetch as any;

  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe('createProductViaApi', () => {
    it('should create product with valid data', async () => {
      const productData = {
        name: 'Test Product',
        description: 'Test description',
        price: 29.99,
        sku: 'TEST-SKU-001',
        stock: 10,
        category: 'Electronics',
      };

      const mockResponse: IProductCreationResponse = {
        message: 'Product created successfully',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await createProductViaApi(productData);

      expect(mockFetch).toHaveBeenCalledWith('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });
      expect(result).toEqual(mockResponse);
    });

    it('should handle product creation with optional imageUrl', async () => {
      const productData = {
        name: 'Product with Image',
        description: 'Test product with image',
        price: 49.99,
        sku: 'TEST-SKU-002',
        stock: 5,
        category: 'Clothing',
        imageUrl: 'https://example.com/image.jpg',
      };

      const mockResponse: IProductCreationResponse = {
        message: 'Product created',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await createProductViaApi(productData);

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/products',
        expect.objectContaining({
          method: 'POST',
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw error when API response is not ok', async () => {
      const productData = {
        name: 'Test Product',
        description: 'Test description',
        price: 29.99,
        sku: 'TEST-SKU-001',
        stock: 10,
        category: 'Electronics',
      };

      const errorMessage = 'Product validation failed';

      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: errorMessage }),
      });

      await expect(createProductViaApi(productData)).rejects.toThrow(errorMessage);
    });

    it('should use default error message when API does not provide one', async () => {
      const productData = {
        name: 'Test Product',
        description: 'Test description',
        price: 29.99,
        sku: 'TEST-SKU-001',
        stock: 10,
        category: 'Electronics',
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({}),
      });

      await expect(createProductViaApi(productData)).rejects.toThrow('Failed to create product');
    });

    it('should send correct Content-Type header', async () => {
      const productData = {
        name: 'Test Product',
        description: 'Test description',
        price: 29.99,
        sku: 'TEST-SKU-001',
        stock: 10,
        category: 'Electronics',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Success' }),
      });

      await createProductViaApi(productData);

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/products',
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json',
          },
        })
      );
    });

    it('should properly serialize product data to JSON', async () => {
      const productData = {
        name: 'JSON Test Product',
        description: 'Description with special chars: {"test": true}',
        price: 99.99,
        sku: 'JSON-SKU-001',
        stock: 50,
        category: 'Special',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Success' }),
      });

      await createProductViaApi(productData);

      const callArgs = mockFetch.mock.calls[0];
      const sentBody = JSON.parse(callArgs[1].body);

      expect(sentBody).toEqual(productData);
    });
  });

  describe('deleteProductViaApi', () => {
    it('should delete product with valid productId', async () => {
      const productId = '507f1f77bcf86cd799439011';

      const mockResponse: IProductDeletionResponse = {
        message: 'Product deleted successfully',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await deleteProductViaApi(productId);

      expect(mockFetch).toHaveBeenCalledWith(`/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      expect(result).toEqual(mockResponse);
    });

    it('should construct correct API endpoint with different productIds', async () => {
      const productIds = ['id-1', 'id-2', 'another-id'];

      for (const productId of productIds) {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ message: 'Deleted' }),
        });

        await deleteProductViaApi(productId);

        expect(mockFetch).toHaveBeenCalledWith(
          `/api/products/${productId}`,
          expect.any(Object)
        );
      }
    });

    it('should throw error when API response is not ok', async () => {
      const productId = '507f1f77bcf86cd799439011';
      const errorMessage = 'Product not found';

      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: errorMessage }),
      });

      await expect(deleteProductViaApi(productId)).rejects.toThrow(errorMessage);
    });

    it('should use error field from API response for deletion errors', async () => {
      const productId = '507f1f77bcf86cd799439011';
      const customErrorMessage = 'Unauthorized to delete this product';

      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: customErrorMessage }),
      });

      await expect(deleteProductViaApi(productId)).rejects.toThrow(customErrorMessage);
    });

    it('should use default error message when API does not provide error field', async () => {
      const productId = '507f1f77bcf86cd799439011';

      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({}),
      });

      await expect(deleteProductViaApi(productId)).rejects.toThrow('Failed to delete product');
    });

    it('should send correct HTTP method for deletion', async () => {
      const productId = '507f1f77bcf86cd799439011';

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Deleted' }),
      });

      await deleteProductViaApi(productId);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });

    it('should send correct Content-Type header for deletion', async () => {
      const productId = '507f1f77bcf86cd799439011';

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Deleted' }),
      });

      await deleteProductViaApi(productId);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json',
          },
        })
      );
    });

    it('should return deletion response with message', async () => {
      const productId = '507f1f77bcf86cd799439011';
      const mockResponse: IProductDeletionResponse = {
        message: 'Product was successfully deleted from database',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await deleteProductViaApi(productId);

      expect(result.message).toBe('Product was successfully deleted from database');
    });

    it('should handle ObjectId format productId', async () => {
      const mongoObjectId = '507f191e810c19729de860ea';

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Deleted' }),
      });

      await deleteProductViaApi(mongoObjectId);

      expect(mockFetch).toHaveBeenCalledWith(
        `/api/products/${mongoObjectId}`,
        expect.any(Object)
      );
    });

    it('should handle special characters in error message', async () => {
      const productId = '507f1f77bcf86cd799439011';
      const errorWithSpecialChars = 'Error: Product "Test" cannot be deleted!';

      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: errorWithSpecialChars }),
      });

      await expect(deleteProductViaApi(productId)).rejects.toThrow(errorWithSpecialChars);
    });
  });
});
