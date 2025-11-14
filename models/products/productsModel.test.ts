import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Db, ObjectId } from 'mongodb';
import { createProduct, findAllProducts, getProductById, deleteProduct } from './productsModel';
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

  describe('findAllProducts', () => {
    it('should return empty array when no products exist', async () => {
      const { products, total } = await findAllProducts(db, 10, 0);

      expect(products).toEqual([]);
      expect(total).toBe(0);
    });

    it('should return all products without pagination', async () => {
      const { connectToMongo } = await import('@/clients/mongodb/mongodb');
      vi.mocked(connectToMongo).mockResolvedValue(db);

      await createProduct({
        name: 'Product 1',
        description: 'First product',
        price: 10.0,
        sku: 'PROD-001',
        stock: 100,
        category: 'Clothing',
        isActive: true,
      });

      await createProduct({
        name: 'Product 2',
        description: 'Second product',
        price: 20.0,
        sku: 'PROD-002',
        stock: 50,
        category: 'Home',
        isActive: true,
      });

      const { products, total } = await findAllProducts(db, 100, 0);

      expect(products).toHaveLength(2);
      expect(total).toBe(2);
      expect(products[0].name).toBe('Product 2');
      expect(products[1].name).toBe('Product 1');
    });

    it('should paginate products correctly', async () => {
      const { connectToMongo } = await import('@/clients/mongodb/mongodb');
      vi.mocked(connectToMongo).mockResolvedValue(db);

      const createdProducts = [];
      for (let i = 1; i <= 5; i++) {
        const product = await createProduct({
          name: `Product ${i}`,
          description: `Product ${i} description`,
          price: i * 10,
          sku: `PROD-${i}`,
          stock: 50,
          category: 'General',
          isActive: true,
        });
        createdProducts.push(product);
        await new Promise((resolve) => setTimeout(resolve, 10));
      }

      const firstPage = await findAllProducts(db, 2, 0);
      const secondPage = await findAllProducts(db, 2, 2);

      expect(firstPage.products).toHaveLength(2);
      expect(firstPage.total).toBe(5);
      expect(secondPage.products).toHaveLength(2);
      expect(secondPage.total).toBe(5);
      const firstPageNames = firstPage.products.map((p) => p.name);
      const secondPageNames = secondPage.products.map((p) => p.name);

      expect(firstPageNames[0]).toBe('Product 5');
      expect(firstPageNames[1]).toBe('Product 4');
      expect(secondPageNames[0]).toBe('Product 3');
      expect(secondPageNames[1]).toBe('Product 2');
    });

    it('should exclude deleted products', async () => {
      const { connectToMongo } = await import('@/clients/mongodb/mongodb');
      vi.mocked(connectToMongo).mockResolvedValue(db);

      await createProduct({
        name: 'Active Product',
        description: 'This product is active',
        price: 50.0,
        sku: 'ACTIVE-001',
        stock: 10,
        category: 'Electronics',
        isActive: true,
      });

      const { products, total } = await findAllProducts(db, 100, 0);

      expect(products).toHaveLength(1);
      expect(total).toBe(1);
      expect(products[0].deleted).toBe(false);
    });

    it('should convert MongoDB ObjectId to string', async () => {
      const { connectToMongo } = await import('@/clients/mongodb/mongodb');
      vi.mocked(connectToMongo).mockResolvedValue(db);

      await createProduct({
        name: 'Test Product',
        description: 'Testing ID conversion',
        price: 99.99,
        sku: 'TEST-ID-001',
        stock: 5,
        category: 'Testing',
        isActive: true,
      });

      const { products } = await findAllProducts(db, 100, 0);

      expect(products[0]._id).toBeDefined();
      expect(typeof products[0]._id).toBe('string');
    });
  });

  describe('getProductById', () => {
    it('should retrieve product by valid ID', async () => {
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

      const createdProduct = await createProduct(productData);
      const retrievedProduct = await getProductById(db, createdProduct._id);

      expect(retrievedProduct).toBeDefined();
      expect(retrievedProduct?._id).toBe(createdProduct._id);
      expect(retrievedProduct?.name).toBe('Test Product');
      expect(retrievedProduct?.description).toBe('Test product description');
      expect(retrievedProduct?.price).toBe(99.99);
      expect(retrievedProduct?.sku).toBe('TEST-SKU-001');
      expect(retrievedProduct?.stock).toBe(10);
      expect(retrievedProduct?.imageUrl).toBe('https://example.com/image.jpg');
      expect(retrievedProduct?.category).toBe('Electronics');
      expect(retrievedProduct?.isActive).toBe(true);
    });

    it('should return null for non-existent product ID', async () => {
      const nonExistentId = '507f1f77bcf86cd799439011';
      const product = await getProductById(db, nonExistentId);

      expect(product).toBeNull();
    });

    it('should return null for invalid ObjectId format', async () => {
      const invalidId = 'invalid-id-format';
      const product = await getProductById(db, invalidId);

      expect(product).toBeNull();
    });

    it('should retrieve product with all fields including timestamps', async () => {
      const productData = {
        name: 'Timestamp Product',
        description: 'Product for timestamp testing',
        price: 49.99,
        sku: 'TS-001',
        stock: 5,
        category: 'Books',
        isActive: true,
      };

      const createdProduct = await createProduct(productData);
      const retrievedProduct = await getProductById(db, createdProduct._id);

      expect(retrievedProduct?.createdAt).toBeInstanceOf(Date);
      expect(retrievedProduct?.updatedAt).toBeInstanceOf(Date);
      expect(retrievedProduct?.deleted).toBe(false);
    });

    it('should retrieve deleted product', async () => {
      const productData = {
        name: 'Deleted Product',
        description: 'Product to be deleted',
        price: 29.99,
        sku: 'DEL-001',
        stock: 3,
        category: 'Clearance',
        isActive: false,
      };

      const createdProduct = await createProduct(productData);
      const collection = db.collection('products');
      await collection.updateOne(
        { _id: new ObjectId(createdProduct._id) },
        { $set: { deleted: true } }
      );

      const retrievedProduct = await getProductById(db, createdProduct._id);

      expect(retrievedProduct).toBeDefined();
      expect(retrievedProduct?.deleted).toBe(true);
    });

    it('should convert MongoDB ObjectId to string', async () => {
      const productData = {
        name: 'ID Convert Test',
        description: 'Testing ObjectId to string conversion',
        price: 19.99,
        sku: 'IDCONV-001',
        stock: 7,
        category: 'Testing',
        isActive: true,
      };

      const createdProduct = await createProduct(productData);
      const retrievedProduct = await getProductById(db, createdProduct._id);

      expect(typeof retrievedProduct?._id).toBe('string');
      expect(retrievedProduct?._id).toMatch(/^[a-f0-9]{24}$/);
    });

    it('should retrieve product without optional imageUrl', async () => {
      const productData = {
        name: 'No Image Product',
        description: 'Product without image',
        price: 39.99,
        sku: 'NOIMG-001',
        stock: 12,
        category: 'Books',
        isActive: true,
      };

      const createdProduct = await createProduct(productData);
      const retrievedProduct = await getProductById(db, createdProduct._id);

      expect(retrievedProduct).toBeDefined();
      expect(retrievedProduct?.imageUrl).toBeUndefined();
    });

    it('should retrieve product with inactive status', async () => {
      const productData = {
        name: 'Inactive Product',
        description: 'This product is inactive',
        price: 15.99,
        sku: 'INACTIVE-001',
        stock: 20,
        category: 'Electronics',
        isActive: false,
      };

      const createdProduct = await createProduct(productData);
      const retrievedProduct = await getProductById(db, createdProduct._id);

      expect(retrievedProduct?.isActive).toBe(false);
    });
  });

  describe('deleteProduct', () => {
    it('should delete a product by marking it as deleted', async () => {
      const productData = {
        name: 'Product to Delete',
        description: 'This product will be deleted',
        price: 29.99,
        sku: 'DELETE-001',
        stock: 5,
        category: 'Testing',
        isActive: true,
      };

      const createdProduct = await createProduct(productData);
      const deleted = await deleteProduct(db, createdProduct._id);

      expect(deleted).toBe(true);

      const deletedProduct = await getProductById(db, createdProduct._id);
      expect(deletedProduct?.deleted).toBe(true);
    });

    it('should update the updatedAt timestamp when deleting', async () => {
      const productData = {
        name: 'Product for Timestamp Update',
        description: 'Testing timestamp update on delete',
        price: 19.99,
        sku: 'TSTMP-DELETE-001',
        stock: 3,
        category: 'Testing',
        isActive: true,
      };

      const createdProduct = await createProduct(productData);
      const createdAt = new Date(createdProduct.createdAt);

      await new Promise((resolve) => setTimeout(resolve, 100));

      await deleteProduct(db, createdProduct._id);

      const deletedProduct = await getProductById(db, createdProduct._id);
      const updatedAt = new Date(deletedProduct?.updatedAt || 0);

      expect(updatedAt.getTime()).toBeGreaterThan(createdAt.getTime());
    });

    it('should return false for non-existent product ID', async () => {
      const nonExistentId = '507f1f77bcf86cd799439011';
      const deleted = await deleteProduct(db, nonExistentId);

      expect(deleted).toBe(false);
    });

    it('should return false for invalid ObjectId format', async () => {
      const invalidId = 'invalid-id-format';
      const deleted = await deleteProduct(db, invalidId);

      expect(deleted).toBe(false);
    });

    it('should exclude deleted products from findAllProducts', async () => {
      const { connectToMongo } = await import('@/clients/mongodb/mongodb');
      vi.mocked(connectToMongo).mockResolvedValue(db);

      const product1 = await createProduct({
        name: 'Active Product',
        description: 'This should be visible',
        price: 50.0,
        sku: 'ACTIVE-DELETE-001',
        stock: 10,
        category: 'Electronics',
        isActive: true,
      });

      const product2 = await createProduct({
        name: 'Product to Delete',
        description: 'This should be hidden after deletion',
        price: 75.0,
        sku: 'DELETE-002',
        stock: 8,
        category: 'Electronics',
        isActive: true,
      });

      await deleteProduct(db, product2._id);

      const { products, total } = await findAllProducts(db, 100, 0);

      expect(products).toHaveLength(1);
      expect(total).toBe(1);
      expect(products[0]._id).toBe(product1._id);
      expect(products[0].name).toBe('Active Product');
    });

    it('should still allow retrieval of deleted product by ID', async () => {
      const productData = {
        name: 'Deleted Product Access',
        description: 'Testing access to deleted product',
        price: 39.99,
        sku: 'DELETED-ACCESS-001',
        stock: 2,
        category: 'Testing',
        isActive: true,
      };

      const createdProduct = await createProduct(productData);
      await deleteProduct(db, createdProduct._id);

      const deletedProduct = await getProductById(db, createdProduct._id);

      expect(deletedProduct).toBeDefined();
      expect(deletedProduct?.deleted).toBe(true);
      expect(deletedProduct?._id).toBe(createdProduct._id);
    });

    it('should handle multiple deletions correctly', async () => {
      const product1 = await createProduct({
        name: 'Product 1',
        description: 'First product',
        price: 10.0,
        sku: 'MULTI-DELETE-001',
        stock: 5,
        category: 'General',
        isActive: true,
      });

      const product2 = await createProduct({
        name: 'Product 2',
        description: 'Second product',
        price: 20.0,
        sku: 'MULTI-DELETE-002',
        stock: 5,
        category: 'General',
        isActive: true,
      });

      const delete1 = await deleteProduct(db, product1._id);
      const delete2 = await deleteProduct(db, product2._id);

      expect(delete1).toBe(true);
      expect(delete2).toBe(true);

      const { products, total } = await findAllProducts(db, 100, 0);

      expect(products).toHaveLength(0);
      expect(total).toBe(0);
    });
  });
});
