import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Db } from 'mongodb';
import { createProduct } from './productsModel';
import { setupMongoTest, teardownMongoTest, IMongoTestContext } from '@/test/utils/mongoTestUtils';

vi.mock('@/clients/mongodb/mongodb', () => ({
  connectToMongo: vi.fn(),
}));

describe('productsModel', () => {
  let context: IMongoTestContext;
  let db: Db;

  beforeEach(async () => {
    context = await setupMongoTest();
    db = context.db;

    const { connectToMongo } = await import('@/clients/mongodb/mongodb');
    vi.mocked(connectToMongo).mockResolvedValue(db);
  });

  afterEach(async () => {
    await teardownMongoTest(context);
    vi.clearAllMocks();
  });

  describe('createProduct', () => {
    it('should create a new product with all fields', async () => {
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

      const product = await createProduct(productData);

      expect(product).toBeDefined();
      expect(product._id).toBeDefined();
      expect(product.name).toBe('Test Product');
      expect(product.description).toBe('Test product description');
      expect(product.price).toBe(99.99);
      expect(product.sku).toBe('TEST-SKU-001');
      expect(product.stock).toBe(10);
      expect(product.imageUrl).toBe('https://example.com/image.jpg');
      expect(product.category).toBe('Electronics');
      expect(product.isActive).toBe(true);
      expect(product.createdAt).toBeInstanceOf(Date);
      expect(product.updatedAt).toBeInstanceOf(Date);
      expect(product.deleted).toBe(false);
    });

    it('should create product without optional imageUrl field', async () => {
      const productData = {
        name: 'Simple Product',
        description: 'A simple product without image',
        price: 49.99,
        sku: 'SIMPLE-001',
        stock: 5,
        category: 'Books',
        isActive: false,
      };

      const product = await createProduct(productData);

      expect(product).toBeDefined();
      expect(product._id).toBeDefined();
      expect(product.name).toBe('Simple Product');
      expect(product.category).toBe('Books');
      expect(product.imageUrl).toBeUndefined();
      expect(product.isActive).toBe(false);
      expect(product.deleted).toBe(false);
    });

    it('should set timestamps correctly', async () => {
      const productData = {
        name: 'Timestamp Test',
        description: 'Testing timestamps',
        price: 29.99,
        sku: 'TIMESTAMP-001',
        stock: 1,
        category: 'Accessories',
        isActive: true,
      };

      const beforeCreate = new Date();
      const product = await createProduct(productData);
      const afterCreate = new Date();

      expect(product.createdAt.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime());
      expect(product.createdAt.getTime()).toBeLessThanOrEqual(afterCreate.getTime());
      expect(product.updatedAt.getTime()).toEqual(product.createdAt.getTime());
    });

    it('should create multiple products independently', async () => {
      const product1Data = {
        name: 'Product 1',
        description: 'First product',
        price: 10.0,
        sku: 'PROD-001',
        stock: 100,
        category: 'Clothing',
        isActive: true,
      };

      const product2Data = {
        name: 'Product 2',
        description: 'Second product',
        price: 20.0,
        sku: 'PROD-002',
        stock: 50,
        category: 'Home',
        isActive: true,
      };

      const product1 = await createProduct(product1Data);
      const product2 = await createProduct(product2Data);

      expect(product1._id).not.toEqual(product2._id);
      expect(product1.name).toBe('Product 1');
      expect(product2.name).toBe('Product 2');
      expect(product1.sku).toBe('PROD-001');
      expect(product2.sku).toBe('PROD-002');
      expect(product1.category).toBe('Clothing');
      expect(product2.category).toBe('Home');
    });

    it('should set deleted flag to false', async () => {
      const productData = {
        name: 'Active Product',
        description: 'This product should not be marked as deleted',
        price: 15.99,
        sku: 'ACTIVE-001',
        stock: 25,
        category: 'Electronics',
        isActive: true,
      };

      const product = await createProduct(productData);

      expect(product.deleted).toBe(false);
    });

    it('should handle zero stock correctly', async () => {
      const productData = {
        name: 'Out of Stock Product',
        description: 'Product with zero stock',
        price: 5.99,
        sku: 'OOS-001',
        stock: 0,
        category: 'Clearance',
        isActive: true,
      };

      const product = await createProduct(productData);

      expect(product.stock).toBe(0);
      expect(product).toBeDefined();
    });
  });
});
