import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';
import { buildApiUrl } from '@/test/utils/apiTestUtils';

vi.mock('@/clients/mongodb/mongodb');
vi.mock('@/models/products/productsModel');
vi.mock('next-intl/server');

import { connectToMongo } from '@/clients/mongodb/mongodb';
import { findAllProducts } from '@/models/products/productsModel';
import { getTranslations } from 'next-intl/server';

describe('/api/products/list route', () => {
  const mockDb = {};
  const fixedDate = new Date('2025-01-01T00:00:00.000Z');
  const mockProducts = [
    { _id: '1', name: 'Product 1', price: 29.99, sku: 'SKU-001', stock: 10, category: 'Electronics', description: 'Test', isActive: true, createdAt: fixedDate, updatedAt: fixedDate, deleted: false },
    { _id: '2', name: 'Product 2', price: 49.99, sku: 'SKU-002', stock: 5, category: 'Clothing', description: 'Test', isActive: true, createdAt: fixedDate, updatedAt: fixedDate, deleted: false },
  ];

  const serializedMockProducts = mockProducts.map(product => ({
    ...product,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  }));

  const mockTranslations = {
    invalidPaginationParameters: 'Invalid pagination parameters',
    fetchFailed: 'Failed to fetch products',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(connectToMongo).mockResolvedValue(mockDb as any);
    vi.mocked(getTranslations).mockResolvedValue(((key: string) => mockTranslations[key as keyof typeof mockTranslations]) as any);
    vi.mocked(findAllProducts).mockResolvedValue({
      products: mockProducts,
      total: 2,
    });
  });

  it('should return products with default pagination', async () => {
    const request = new NextRequest(new URL(buildApiUrl('en', '/api/products/list')));
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data).toEqual(serializedMockProducts);
    expect(data.pagination.page).toBe(1);
    expect(data.pagination.pageSize).toBe(10);
    expect(data.pagination.total).toBe(2);
    expect(data.pagination.totalPages).toBe(1);
  });

  it('should return products with custom page and pageSize', async () => {
    const request = new NextRequest(new URL(buildApiUrl('en', '/api/products/list?page=2&pageSize=25')));
    await GET(request);

    expect(vi.mocked(findAllProducts)).toHaveBeenCalledWith(mockDb, 25, 25);
  });

  it('should calculate correct offset based on page and pageSize', async () => {
    const request = new NextRequest(new URL(buildApiUrl('pl', '/api/products/list?page=3&pageSize=10')));
    await GET(request);

    expect(vi.mocked(findAllProducts)).toHaveBeenCalledWith(mockDb, 10, 20);
  });

  it('should return error for page less than 1', async () => {
    const request = new NextRequest(new URL(buildApiUrl('en', '/api/products/list?page=0&pageSize=10')));
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid pagination parameters');
  });

  it('should return error for pageSize less than 1', async () => {
    const request = new NextRequest(new URL(buildApiUrl('pl', '/api/products/list?page=1&pageSize=0')));
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid pagination parameters');
  });

  it('should return error for pageSize greater than 100', async () => {
    const request = new NextRequest(new URL(buildApiUrl('en', '/api/products/list?page=1&pageSize=101')));
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid pagination parameters');
  });

  it('should allow pageSize of 100', async () => {
    vi.mocked(findAllProducts).mockResolvedValue({
      products: mockProducts,
      total: 100,
    });

    const request = new NextRequest(new URL(buildApiUrl('pl', '/api/products/list?page=1&pageSize=100')));
    const response = await GET(request);

    expect(response.status).toBe(200);
  });

  it('should handle database errors gracefully', async () => {
    vi.mocked(findAllProducts).mockRejectedValue(new Error('Database error'));

    const request = new NextRequest(new URL(buildApiUrl('en', '/api/products/list')));
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to fetch products');
  });

  it('should call getTranslations with correct namespace', async () => {
    const request = new NextRequest(new URL(buildApiUrl('en', '/api/products/list')));
    await GET(request);

    expect(vi.mocked(getTranslations)).toHaveBeenCalledWith({
      locale: 'en',
      namespace: 'api.products',
    });
  });

  it('should calculate totalPages correctly', async () => {
    vi.mocked(findAllProducts).mockResolvedValue({
      products: mockProducts,
      total: 25,
    });

    const request = new NextRequest(new URL(buildApiUrl('pl', '/api/products/list?pageSize=10')));
    const response = await GET(request);
    const data = await response.json();

    expect(data.pagination.totalPages).toBe(3);
  });

  it('should handle empty products list', async () => {
    vi.mocked(findAllProducts).mockResolvedValue({
      products: [],
      total: 0,
    });

    const request = new NextRequest(new URL(buildApiUrl('en', '/api/products/list')));
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data).toEqual([]);
    expect(data.pagination.total).toBe(0);
    expect(data.pagination.totalPages).toBe(0);
  });

  it('should parse query parameters correctly', async () => {
    const request = new NextRequest(new URL(buildApiUrl('pl', '/api/products/list?page=5&pageSize=50')));
    await GET(request);

    expect(vi.mocked(findAllProducts)).toHaveBeenCalledWith(mockDb, 50, 200);
  });
});
