import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';
import { buildApiUrl } from '@/test/utils/apiTestUtils';

vi.mock('@/clients/mongodb/mongodb');
vi.mock('@/models/products/productsModel');
vi.mock('next-intl/server');

import { connectToMongo } from '@/clients/mongodb/mongodb';
import { getProductById } from '@/models/products/productsModel';
import { getTranslations } from 'next-intl/server';

describe('/api/products/[id] route', () => {
  const mockDb = {};
  const fixedDate = new Date('2025-01-01T00:00:00.000Z');
  const mockProduct = {
    _id: '507f1f77bcf86cd799439011',
    name: 'Test Product',
    description: 'Test product description',
    price: 99.99,
    sku: 'TEST-SKU-001',
    stock: 10,
    imageUrl: 'https://example.com/image.jpg',
    category: 'Electronics',
    isActive: true,
    createdAt: fixedDate,
    updatedAt: fixedDate,
    deleted: false,
  };

  const serializedMockProduct = {
    ...mockProduct,
    createdAt: mockProduct.createdAt.toISOString(),
    updatedAt: mockProduct.updatedAt.toISOString(),
  };

  const mockTranslations = {
    notFound: 'Product not found',
    fetchFailed: 'Failed to fetch product',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(connectToMongo).mockResolvedValue(mockDb as any);
    vi.mocked(getTranslations).mockResolvedValue(((key: string) => mockTranslations[key as keyof typeof mockTranslations]) as any);
    vi.mocked(getProductById).mockResolvedValue(mockProduct as any);
  });

  it('should return product by valid ID', async () => {
    const params = Promise.resolve({ id: '507f1f77bcf86cd799439011' });
    const request = new NextRequest(new URL(buildApiUrl('en', '/api/products/507f1f77bcf86cd799439011')));
    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data).toEqual(serializedMockProduct);
  });

  it('should call getProductById with correct parameters', async () => {
    const params = Promise.resolve({ id: '507f1f77bcf86cd799439011' });
    const request = new NextRequest(new URL(buildApiUrl('en', '/api/products/507f1f77bcf86cd799439011')));
    await GET(request, { params });

    expect(vi.mocked(getProductById)).toHaveBeenCalledWith(mockDb, '507f1f77bcf86cd799439011');
  });

  it('should return 404 when product not found', async () => {
    vi.mocked(getProductById).mockResolvedValue(null);

    const params = Promise.resolve({ id: '507f1f77bcf86cd799439011' });
    const request = new NextRequest(new URL(buildApiUrl('en', '/api/products/507f1f77bcf86cd799439011')));
    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Product not found');
  });

  it('should return 404 when ID is empty', async () => {
    const params = Promise.resolve({ id: '' });
    const request = new NextRequest(new URL(buildApiUrl('en', '/api/products/')));
    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Product not found');
  });

  it('should handle database errors gracefully', async () => {
    vi.mocked(getProductById).mockRejectedValue(new Error('Database error'));

    const params = Promise.resolve({ id: '507f1f77bcf86cd799439011' });
    const request = new NextRequest(new URL(buildApiUrl('en', '/api/products/507f1f77bcf86cd799439011')));
    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to fetch product');
  });

  it('should call getTranslations with correct namespace', async () => {
    const params = Promise.resolve({ id: '507f1f77bcf86cd799439011' });
    const request = new NextRequest(new URL(buildApiUrl('en', '/api/products/507f1f77bcf86cd799439011')));
    await GET(request, { params });

    expect(vi.mocked(getTranslations)).toHaveBeenCalledWith({
      locale: 'en',
      namespace: 'api.product',
    });
  });

  it('should return product with all fields', async () => {
    const params = Promise.resolve({ id: '507f1f77bcf86cd799439011' });
    const request = new NextRequest(new URL(buildApiUrl('en', '/api/products/507f1f77bcf86cd799439011')));
    const response = await GET(request, { params });
    const data = await response.json();

    expect(data.data._id).toBe('507f1f77bcf86cd799439011');
    expect(data.data.name).toBe('Test Product');
    expect(data.data.description).toBe('Test product description');
    expect(data.data.price).toBe(99.99);
    expect(data.data.sku).toBe('TEST-SKU-001');
    expect(data.data.stock).toBe(10);
    expect(data.data.imageUrl).toBe('https://example.com/image.jpg');
    expect(data.data.category).toBe('Electronics');
    expect(data.data.isActive).toBe(true);
    expect(data.data.deleted).toBe(false);
  });

  it('should handle product without optional imageUrl', async () => {
    const productWithoutImage = { ...mockProduct, imageUrl: undefined };
    vi.mocked(getProductById).mockResolvedValue(productWithoutImage as any);

    const params = Promise.resolve({ id: '507f1f77bcf86cd799439011' });
    const request = new NextRequest(new URL(buildApiUrl('en', '/api/products/507f1f77bcf86cd799439011')));
    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.imageUrl).toBeUndefined();
  });

  it('should return deleted product', async () => {
    const deletedProduct = { ...mockProduct, deleted: true };
    vi.mocked(getProductById).mockResolvedValue(deletedProduct as any);

    const params = Promise.resolve({ id: '507f1f77bcf86cd799439011' });
    const request = new NextRequest(new URL(buildApiUrl('en', '/api/products/507f1f77bcf86cd799439011')));
    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.deleted).toBe(true);
  });

  it('should handle invalid ObjectId format', async () => {
    vi.mocked(getProductById).mockResolvedValue(null);

    const params = Promise.resolve({ id: 'invalid-id-format' });
    const request = new NextRequest(new URL(buildApiUrl('en', '/api/products/invalid-id-format')));
    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Product not found');
  });

  it('should return inactive product', async () => {
    const inactiveProduct = { ...mockProduct, isActive: false };
    vi.mocked(getProductById).mockResolvedValue(inactiveProduct as any);

    const params = Promise.resolve({ id: '507f1f77bcf86cd799439011' });
    const request = new NextRequest(new URL(buildApiUrl('en', '/api/products/507f1f77bcf86cd799439011')));
    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.isActive).toBe(false);
  });

  it('should work with Polish locale URL', async () => {
    const params = Promise.resolve({ id: '507f1f77bcf86cd799439011' });
    const request = new NextRequest(new URL(buildApiUrl('pl', '/api/products/507f1f77bcf86cd799439011')));
    const response = await GET(request, { params });

    expect(response.status).toBe(200);
    expect(vi.mocked(getTranslations)).toHaveBeenCalledWith({
      locale: 'pl',
      namespace: 'api.product',
    });
  });
});
