import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getProductsList, IProductsListResponse } from './productsListApiRepository';

describe('productsListApiRepository', () => {
  const mockFetch = vi.fn();
  global.fetch = mockFetch as any;

  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe('getProductsList', () => {
    it('should fetch products list with correct parameters', async () => {
      const mockResponse: IProductsListResponse = {
        data: [
          { _id: '1', name: 'Product 1', price: 29.99, sku: 'SKU-001', stock: 10, category: 'Electronics', description: 'Test product', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        ],
        pagination: {
          page: 1,
          pageSize: 10,
          total: 1,
          totalPages: 1,
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await getProductsList(1, 10);

      expect(mockFetch).toHaveBeenCalledWith('/api/products/list?page=1&pageSize=10');
      expect(result).toEqual(mockResponse);
    });

    it('should handle different page and pageSize parameters', async () => {
      const mockResponse: IProductsListResponse = {
        data: [],
        pagination: {
          page: 2,
          pageSize: 25,
          total: 50,
          totalPages: 2,
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await getProductsList(2, 25);

      expect(mockFetch).toHaveBeenCalledWith('/api/products/list?page=2&pageSize=25');
    });

    it('should throw error when API response is not ok', async () => {
      const errorMessage = 'Invalid pagination parameters';

      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: errorMessage }),
      });

      await expect(getProductsList(0, 10)).rejects.toThrow(errorMessage);
    });

    it('should use error message from API response', async () => {
      const customErrorMessage = 'Failed to fetch products';

      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: customErrorMessage }),
      });

      try {
        await getProductsList(1, 10);
      } catch (error) {
        expect(error).toEqual(new Error(customErrorMessage));
      }
    });

    it('should return empty products array when no products exist', async () => {
      const mockResponse: IProductsListResponse = {
        data: [],
        pagination: {
          page: 1,
          pageSize: 10,
          total: 0,
          totalPages: 0,
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await getProductsList(1, 10);

      expect(result.data).toEqual([]);
      expect(result.pagination.total).toBe(0);
    });

    it('should handle multiple products in response', async () => {
      const mockResponse: IProductsListResponse = {
        data: [
          { _id: '1', name: 'Product 1', price: 29.99, sku: 'SKU-001', stock: 10, category: 'Electronics', description: 'Test product 1', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { _id: '2', name: 'Product 2', price: 49.99, sku: 'SKU-002', stock: 5, category: 'Clothing', description: 'Test product 2', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { _id: '3', name: 'Product 3', price: 19.99, sku: 'SKU-003', stock: 20, category: 'Books', description: 'Test product 3', isActive: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        ],
        pagination: {
          page: 1,
          pageSize: 10,
          total: 3,
          totalPages: 1,
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await getProductsList(1, 10);

      expect(result.data).toHaveLength(3);
      expect(result.pagination.total).toBe(3);
    });

    it('should preserve product data structure', async () => {
      const mockProduct = {
        _id: 'test-id',
        name: 'Test Product',
        price: 29.99,
        sku: 'TEST-SKU-001',
        stock: 100,
        category: 'Testing',
        description: 'This is a test product',
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      const mockResponse: IProductsListResponse = {
        data: [mockProduct],
        pagination: {
          page: 1,
          pageSize: 10,
          total: 1,
          totalPages: 1,
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await getProductsList(1, 10);

      expect(result.data[0]).toEqual(mockProduct);
      expect(result.data[0].name).toBe('Test Product');
      expect(result.data[0].price).toBe(29.99);
      expect(result.data[0].sku).toBe('TEST-SKU-001');
    });
  });
});
