import { IProductCreateInput, IProduct } from '@/domain/product';
import { createProduct, PRODUCTS_COLLECTION } from '@/models/products/productsModel';
import { addProductToWeaviate } from '@/models/products/weaviateProductsModel';
import { connectToMongo } from '@/clients/mongodb/mongodb';
import { connectToWeaviate } from '@/clients/weaviate/weaviate';

export const TEST_PRODUCTS: IProductCreateInput[] = [
  {
    name: 'Gaming Laptop Pro X1',
    description: 'High-performance gaming laptop with RTX 4080, 32GB RAM, 1TB SSD. Perfect for gaming and content creation.',
    price: 4999.99,
    sku: 'LAPTOP-GAMING-001',
    stock: 15,
    category: 'Laptops',
    isActive: true,
  },
  {
    name: 'Business Laptop Elite',
    description: 'Professional laptop for business use. Intel i7, 16GB RAM, 512GB SSD. Lightweight and portable.',
    price: 3499.99,
    sku: 'LAPTOP-BIZ-001',
    stock: 25,
    category: 'Laptops',
    isActive: true,
  },
  {
    name: 'Budget Laptop Basic',
    description: 'Affordable laptop for everyday tasks. Intel i5, 8GB RAM, 256GB SSD.',
    price: 1999.99,
    sku: 'LAPTOP-BASIC-001',
    stock: 50,
    category: 'Laptops',
    isActive: true,
  },
  {
    name: 'Samsung Galaxy S24 Ultra',
    description: 'Flagship smartphone with 200MP camera, 12GB RAM, 512GB storage. AI-powered features.',
    price: 5499.99,
    sku: 'PHONE-SAM-001',
    stock: 30,
    category: 'Smartphones',
    isActive: true,
  },
  {
    name: 'iPhone 15 Pro Max',
    description: 'Apple flagship phone with A17 Pro chip, titanium design, 256GB storage.',
    price: 5999.99,
    sku: 'PHONE-APPLE-001',
    stock: 20,
    category: 'Smartphones',
    isActive: true,
  },
  {
    name: 'Xiaomi 14 Pro',
    description: 'Premium smartphone with Leica camera, Snapdragon 8 Gen 3, 256GB storage.',
    price: 3999.99,
    sku: 'PHONE-XIAOMI-001',
    stock: 40,
    category: 'Smartphones',
    isActive: true,
  },
  {
    name: 'Mechanical Gaming Keyboard RGB',
    description: 'Mechanical keyboard with Cherry MX switches, RGB backlight, programmable keys.',
    price: 599.99,
    sku: 'KB-GAMING-001',
    stock: 100,
    category: 'Gaming Peripherals',
    isActive: true,
  },
  {
    name: 'Gaming Mouse Pro',
    description: 'High-precision gaming mouse with 25000 DPI sensor, RGB lighting, 8 programmable buttons.',
    price: 299.99,
    sku: 'MOUSE-GAMING-001',
    stock: 80,
    category: 'Gaming Peripherals',
    isActive: true,
  },
  {
    name: 'Sony WH-1000XM5 Headphones',
    description: 'Premium wireless noise-cancelling headphones with 30-hour battery life.',
    price: 1499.99,
    sku: 'AUDIO-SONY-001',
    stock: 35,
    category: 'Audio',
    isActive: true,
  },
  {
    name: 'AirPods Pro 2',
    description: 'Apple wireless earbuds with active noise cancellation and spatial audio.',
    price: 1199.99,
    sku: 'AUDIO-APPLE-001',
    stock: 45,
    category: 'Audio',
    isActive: true,
  },
];

let createdProducts: IProduct[] = [];

export const setupTestProducts = async (): Promise<void> => {
  console.log('[SETUP] Creating test products...');

  const weaviateClient = await connectToWeaviate();

  for (const productData of TEST_PRODUCTS) {
    const product = await createProduct(productData);
    await addProductToWeaviate(weaviateClient, product);
    createdProducts.push(product);
  }

  console.log(`[SETUP] Created ${createdProducts.length} test products`);
};

export const teardownTestProducts = async (): Promise<void> => {
  console.log('[TEARDOWN] Cleaning up test products...');

  const db = await connectToMongo();
  const collection = db.collection(PRODUCTS_COLLECTION);

  const productIds = createdProducts.map((p) => p._id);

  if (productIds.length > 0) {
    const { ObjectId } = await import('mongodb');
    await collection.deleteMany({
      _id: { $in: productIds.map((id) => new ObjectId(id)) },
    });
  }

  createdProducts = [];
  console.log('[TEARDOWN] Test products cleaned up');
};
