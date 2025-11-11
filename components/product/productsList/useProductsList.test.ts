import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useProductsList } from './useProductsList';
import * as productsRepository from '@/repositories/api/products/productsListApiRepository';

vi.mock('@/repositories/api/products/productsListApiRepository');

describe('useProductsList', () => {
  const fixedDate = new Date('2025-01-01T00:00:00.000Z');
  const mockProducts = [
    { _id: '1', name: 'Product 1', price: 29.99, sku: 'SKU-001', stock: 10, category: 'Electronics', description: 'Test', isActive: true, createdAt: fixedDate, updatedAt: fixedDate, deleted: false },
    { _id: '2', name: 'Product 2', price: 49.99, sku: 'SKU-002', stock: 5, category: 'Clothing', description: 'Test', isActive: true, createdAt: fixedDate, updatedAt: fixedDate, deleted: false },
  ];

  const mockResponse = {
    data: mockProducts,
    pagination: {
      page: 1,
      pageSize: 10,
      total: 2,
      totalPages: 1,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(productsRepository.getProductsList).mockResolvedValue(mockResponse);
  });

  it('should initialize with loading state', async () => {
    const { result } = renderHook(() => useProductsList(10));

    // Initially should be loading
    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBe('');
    expect(result.current.pagination.page).toBe(1);
    expect(result.current.pagination.pageSize).toBe(10);

    // Wait for loading to complete
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // After loading, products should be populated
    expect(result.current.products).toEqual(mockProducts);
  });

  it('should load products on mount', async () => {
    const { result } = renderHook(() => useProductsList(10));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.products).toEqual(mockProducts);
    expect(result.current.pagination.total).toBe(2);
    expect(result.current.pagination.totalPages).toBe(1);
  });

  it('should use initial page size parameter', async () => {
    vi.mocked(productsRepository.getProductsList).mockResolvedValue({
      data: mockProducts,
      pagination: {
        page: 1,
        pageSize: 25,
        total: 2,
        totalPages: 1,
      },
    });

    const { result } = renderHook(() => useProductsList(25));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.pagination.pageSize).toBe(25);
    expect(vi.mocked(productsRepository.getProductsList)).toHaveBeenCalledWith(1, 25);
  });

  it('should use default page size of 10 when not specified', async () => {
    vi.mocked(productsRepository.getProductsList).mockResolvedValue({
      data: mockProducts,
      pagination: {
        page: 1,
        pageSize: 10,
        total: 2,
        totalPages: 1,
      },
    });

    const { result } = renderHook(() => useProductsList());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(vi.mocked(productsRepository.getProductsList)).toHaveBeenCalledWith(1, 10);
  });

  it('should change page when setPage is called', async () => {
    const { result } = renderHook(() => useProductsList(10));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.setPage(2);
    });

    await waitFor(() => {
      expect(result.current.pagination.page).toBe(2);
    });
  });

  it('should reset to page 1 when page size changes', async () => {
    const { result } = renderHook(() => useProductsList(10));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.setPage(3);
    });

    await waitFor(() => {
      expect(result.current.pagination.page).toBe(3);
    });

    act(() => {
      result.current.setPageSize(25);
    });

    await waitFor(() => {
      expect(result.current.pagination.page).toBe(1);
      expect(result.current.pagination.pageSize).toBe(25);
    });
  });

  it('should handle API errors gracefully', async () => {
    const errorMessage = 'Failed to fetch products';
    vi.mocked(productsRepository.getProductsList).mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useProductsList(10));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe(errorMessage);
    expect(result.current.products).toEqual([]);
  });

  it('should clear error and set loading when fetching new data', async () => {
    const errorMessage = 'Initial error';
    vi.mocked(productsRepository.getProductsList)
      .mockRejectedValueOnce(new Error(errorMessage))
      .mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useProductsList(10));

    await waitFor(() => {
      expect(result.current.error).toBe(errorMessage);
    });

    vi.mocked(productsRepository.getProductsList).mockResolvedValueOnce(mockResponse);

    act(() => {
      result.current.setPage(2);
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe('');
    expect(result.current.products).toEqual(mockProducts);
  });

  it('should maintain pagination state correctly', async () => {
    vi.mocked(productsRepository.getProductsList).mockResolvedValue({
      data: mockProducts,
      pagination: {
        page: 1,
        pageSize: 20,
        total: 2,
        totalPages: 1,
      },
    });

    const { result } = renderHook(() => useProductsList(20));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.pagination.page).toBe(1);
    expect(result.current.pagination.pageSize).toBe(20);
    expect(result.current.pagination.total).toBe(2);
    expect(result.current.pagination.totalPages).toBe(1);
  });

  it('should handle empty products list', async () => {
    vi.mocked(productsRepository.getProductsList).mockResolvedValue({
      data: [],
      pagination: {
        page: 1,
        pageSize: 10,
        total: 0,
        totalPages: 0,
      },
    });

    const { result } = renderHook(() => useProductsList(10));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.products).toEqual([]);
    expect(result.current.pagination.total).toBe(0);
    expect(result.current.error).toBe('');
  });

  it('should fetch products with correct parameters on page change', async () => {
    vi.mocked(productsRepository.getProductsList).mockResolvedValue({
      data: mockProducts,
      pagination: {
        page: 1,
        pageSize: 15,
        total: 2,
        totalPages: 1,
      },
    });

    const { result } = renderHook(() => useProductsList(15));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(vi.mocked(productsRepository.getProductsList)).toHaveBeenCalledWith(1, 15);

    vi.mocked(productsRepository.getProductsList).mockClear();
    vi.mocked(productsRepository.getProductsList).mockResolvedValue({
      data: mockProducts,
      pagination: {
        page: 3,
        pageSize: 15,
        total: 2,
        totalPages: 1,
      },
    });

    act(() => {
      result.current.setPage(3);
    });

    await waitFor(() => {
      expect(vi.mocked(productsRepository.getProductsList)).toHaveBeenCalledWith(3, 15);
    });
  });

  it('should fetch products with correct parameters on page size change', async () => {
    const { result } = renderHook(() => useProductsList(10));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    vi.mocked(productsRepository.getProductsList).mockClear();

    act(() => {
      result.current.setPageSize(50);
    });

    await waitFor(() => {
      expect(vi.mocked(productsRepository.getProductsList)).toHaveBeenCalledWith(1, 50);
    });
  });

  it('should handle rapid page changes', async () => {
    vi.mocked(productsRepository.getProductsList).mockImplementation(async (page, pageSize) => ({
      data: mockProducts,
      pagination: {
        page,
        pageSize,
        total: 2,
        totalPages: 1,
      },
    }));

    const { result } = renderHook(() => useProductsList(10));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.setPage(2);
      result.current.setPage(3);
      result.current.setPage(4);
    });

    await waitFor(() => {
      expect(result.current.pagination.page).toBe(4);
    });

    expect(vi.mocked(productsRepository.getProductsList)).toHaveBeenLastCalledWith(4, 10);
  });

  it('should set isLoading to true when fetching starts', async () => {
    let resolvePromise: (value: any) => void;
    const promise = new Promise<any>((resolve) => {
      resolvePromise = resolve;
    });

    vi.mocked(productsRepository.getProductsList).mockReturnValueOnce(promise);

    const { result } = renderHook(() => useProductsList(10));

    expect(result.current.isLoading).toBe(true);

    act(() => {
      resolvePromise({
        data: mockProducts,
        pagination: {
          page: 1,
          pageSize: 10,
          total: 2,
          totalPages: 1,
        },
      });
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('should preserve product data when error occurs on page change', async () => {
    const { result } = renderHook(() => useProductsList(10));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const previousProducts = result.current.products;

    vi.mocked(productsRepository.getProductsList).mockRejectedValueOnce(new Error('Fetch failed'));

    act(() => {
      result.current.setPage(2);
    });

    await waitFor(() => {
      expect(result.current.error).toBe('Fetch failed');
    });

    expect(result.current.products).toEqual(previousProducts);
  });

  it('should handle multiple page size changes', async () => {
    const { result } = renderHook(() => useProductsList(10));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.setPageSize(25);
    });

    await waitFor(() => {
      expect(result.current.pagination.pageSize).toBe(25);
    });

    act(() => {
      result.current.setPageSize(50);
    });

    await waitFor(() => {
      expect(result.current.pagination.pageSize).toBe(50);
      expect(result.current.pagination.page).toBe(1);
    });
  });
});
