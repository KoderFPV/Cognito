import { describe, it, expect } from 'vitest';
import { productSchema, validateProductData } from './productValidation.service';

describe('productValidation.service', () => {
  describe('productSchema', () => {
    it('should validate correct product data', () => {
      const validData = {
        name: 'Test Product',
        description: 'Test description',
        price: 99.99,
        sku: 'TEST-SKU-001',
        stock: 10,
        isActive: true,
      };

      const result = productSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate product with optional fields', () => {
      const validData = {
        name: 'Test Product',
        description: 'Test description',
        price: 99.99,
        sku: 'TEST-SKU-001',
        stock: 10,
        imageUrl: 'https://example.com/image.jpg',
        category: 'Electronics',
        isActive: true,
      };

      const result = productSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject empty name', () => {
      const invalidData = {
        name: '',
        description: 'Test description',
        price: 99.99,
        sku: 'TEST-SKU-001',
        stock: 10,
        isActive: true,
      };

      const result = productSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject name exceeding 200 characters', () => {
      const invalidData = {
        name: 'a'.repeat(201),
        description: 'Test description',
        price: 99.99,
        sku: 'TEST-SKU-001',
        stock: 10,
        isActive: true,
      };

      const result = productSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject empty description', () => {
      const invalidData = {
        name: 'Test Product',
        description: '',
        price: 99.99,
        sku: 'TEST-SKU-001',
        stock: 10,
        isActive: true,
      };

      const result = productSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject description exceeding 2000 characters', () => {
      const invalidData = {
        name: 'Test Product',
        description: 'a'.repeat(2001),
        price: 99.99,
        sku: 'TEST-SKU-001',
        stock: 10,
        isActive: true,
      };

      const result = productSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject negative price', () => {
      const invalidData = {
        name: 'Test Product',
        description: 'Test description',
        price: -10,
        sku: 'TEST-SKU-001',
        stock: 10,
        isActive: true,
      };

      const result = productSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject zero price', () => {
      const invalidData = {
        name: 'Test Product',
        description: 'Test description',
        price: 0,
        sku: 'TEST-SKU-001',
        stock: 10,
        isActive: true,
      };

      const result = productSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject empty sku', () => {
      const invalidData = {
        name: 'Test Product',
        description: 'Test description',
        price: 99.99,
        sku: '',
        stock: 10,
        isActive: true,
      };

      const result = productSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject sku exceeding 50 characters', () => {
      const invalidData = {
        name: 'Test Product',
        description: 'Test description',
        price: 99.99,
        sku: 'a'.repeat(51),
        stock: 10,
        isActive: true,
      };

      const result = productSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject negative stock', () => {
      const invalidData = {
        name: 'Test Product',
        description: 'Test description',
        price: 99.99,
        sku: 'TEST-SKU-001',
        stock: -1,
        isActive: true,
      };

      const result = productSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should accept zero stock', () => {
      const validData = {
        name: 'Test Product',
        description: 'Test description',
        price: 99.99,
        sku: 'TEST-SKU-001',
        stock: 0,
        isActive: true,
      };

      const result = productSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject non-integer stock', () => {
      const invalidData = {
        name: 'Test Product',
        description: 'Test description',
        price: 99.99,
        sku: 'TEST-SKU-001',
        stock: 10.5,
        isActive: true,
      };

      const result = productSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject invalid imageUrl', () => {
      const invalidData = {
        name: 'Test Product',
        description: 'Test description',
        price: 99.99,
        sku: 'TEST-SKU-001',
        stock: 10,
        imageUrl: 'not-a-url',
        isActive: true,
      };

      const result = productSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject empty category', () => {
      const invalidData = {
        name: 'Test Product',
        description: 'Test description',
        price: 99.99,
        sku: 'TEST-SKU-001',
        stock: 10,
        category: '',
        isActive: true,
      };

      const result = productSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject category exceeding 100 characters', () => {
      const invalidData = {
        name: 'Test Product',
        description: 'Test description',
        price: 99.99,
        sku: 'TEST-SKU-001',
        stock: 10,
        category: 'a'.repeat(101),
        isActive: true,
      };

      const result = productSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('validateProductData', () => {
    it('should validate and return typed data', () => {
      const validData = {
        name: 'Test Product',
        description: 'Test description',
        price: 99.99,
        sku: 'TEST-SKU-001',
        stock: 10,
        isActive: true,
      };

      const result = validateProductData(validData);
      expect(result).toEqual(validData);
    });

    it('should throw error for invalid data', () => {
      const invalidData = {
        name: '',
        description: 'Test description',
        price: 99.99,
        sku: 'TEST-SKU-001',
        stock: 10,
        isActive: true,
      };

      expect(() => validateProductData(invalidData)).toThrow();
    });

    it('should validate data with optional fields', () => {
      const validData = {
        name: 'Test Product',
        description: 'Test description',
        price: 99.99,
        sku: 'TEST-SKU-001',
        stock: 10,
        imageUrl: 'https://example.com/image.jpg',
        category: 'Electronics',
        isActive: true,
      };

      const result = validateProductData(validData);
      expect(result).toEqual(validData);
    });
  });
});
