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
    attributes: [
      { name: 'RAM', value: '32', unit: 'GB' },
      { name: 'GPU', value: 'RTX 4080' },
      { name: 'Storage', value: '1', unit: 'TB SSD' },
      { name: 'Processor', value: 'Intel Core i9-13900HX' },
    ],
  },
  {
    name: 'Business Laptop Elite',
    description: 'Professional laptop for business use. Intel i7, 16GB RAM, 512GB SSD. Lightweight and portable.',
    price: 3499.99,
    sku: 'LAPTOP-BIZ-001',
    stock: 25,
    category: 'Laptops',
    isActive: true,
    attributes: [
      { name: 'RAM', value: '16', unit: 'GB' },
      { name: 'Processor', value: 'Intel Core i7-1365U' },
      { name: 'Storage', value: '512', unit: 'GB SSD' },
      { name: 'Weight', value: '1.3', unit: 'kg' },
    ],
  },
  {
    name: 'Budget Laptop Basic',
    description: 'Affordable laptop for everyday tasks. Intel i5, 8GB RAM, 256GB SSD.',
    price: 1999.99,
    sku: 'LAPTOP-BASIC-001',
    stock: 50,
    category: 'Laptops',
    isActive: true,
    attributes: [
      { name: 'RAM', value: '8', unit: 'GB' },
      { name: 'Processor', value: 'Intel Core i5-1235U' },
      { name: 'Storage', value: '256', unit: 'GB SSD' },
    ],
  },
  {
    name: 'Samsung Galaxy S24 Ultra',
    description: 'Flagship smartphone with 200MP camera, 12GB RAM, 512GB storage. AI-powered features.',
    price: 5499.99,
    sku: 'PHONE-SAM-001',
    stock: 30,
    category: 'Smartphones',
    isActive: true,
    attributes: [
      { name: 'RAM', value: '12', unit: 'GB' },
      { name: 'Storage', value: '512', unit: 'GB' },
      { name: 'Camera', value: '200', unit: 'MP' },
      { name: 'Display', value: '6.8', unit: 'inch' },
    ],
  },
  {
    name: 'iPhone 15 Pro Max',
    description: 'Apple flagship phone with A17 Pro chip, titanium design, 256GB storage.',
    price: 5999.99,
    sku: 'PHONE-APPLE-001',
    stock: 20,
    category: 'Smartphones',
    isActive: true,
    attributes: [
      { name: 'Processor', value: 'A17 Pro' },
      { name: 'Storage', value: '256', unit: 'GB' },
      { name: 'Display', value: '6.7', unit: 'inch' },
      { name: 'Material', value: 'Titanium' },
    ],
  },
  {
    name: 'Xiaomi 14 Pro',
    description: 'Premium smartphone with Leica camera, Snapdragon 8 Gen 3, 256GB storage.',
    price: 3999.99,
    sku: 'PHONE-XIAOMI-001',
    stock: 40,
    category: 'Smartphones',
    isActive: true,
    attributes: [
      { name: 'Processor', value: 'Snapdragon 8 Gen 3' },
      { name: 'Storage', value: '256', unit: 'GB' },
      { name: 'Camera', value: 'Leica' },
    ],
  },
  {
    name: 'Mechanical Gaming Keyboard RGB',
    description: 'Mechanical keyboard with Cherry MX switches, RGB backlight, programmable keys.',
    price: 599.99,
    sku: 'KB-GAMING-001',
    stock: 100,
    category: 'Gaming Peripherals',
    isActive: true,
    attributes: [
      { name: 'Switch Type', value: 'Cherry MX' },
      { name: 'Backlight', value: 'RGB' },
      { name: 'Keys', value: '104' },
    ],
  },
  {
    name: 'Gaming Mouse Pro',
    description: 'High-precision gaming mouse with 25000 DPI sensor, RGB lighting, 8 programmable buttons.',
    price: 299.99,
    sku: 'MOUSE-GAMING-001',
    stock: 80,
    category: 'Gaming Peripherals',
    isActive: true,
    attributes: [
      { name: 'DPI', value: '25000' },
      { name: 'Buttons', value: '8' },
      { name: 'Lighting', value: 'RGB' },
    ],
  },
  {
    name: 'Sony WH-1000XM5 Headphones',
    description: 'Premium wireless noise-cancelling headphones with 30-hour battery life.',
    price: 1499.99,
    sku: 'AUDIO-SONY-001',
    stock: 35,
    category: 'Audio',
    isActive: true,
    attributes: [
      { name: 'Battery Life', value: '30', unit: 'hours' },
      { name: 'Noise Cancellation', value: 'Active' },
      { name: 'Connection', value: 'Wireless Bluetooth' },
    ],
  },
  {
    name: 'AirPods Pro 2',
    description: 'Apple wireless earbuds with active noise cancellation and spatial audio.',
    price: 1199.99,
    sku: 'AUDIO-APPLE-001',
    stock: 45,
    category: 'Audio',
    isActive: true,
    attributes: [
      { name: 'Noise Cancellation', value: 'Active' },
      { name: 'Audio', value: 'Spatial Audio' },
      { name: 'Type', value: 'Wireless Earbuds' },
    ],
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
