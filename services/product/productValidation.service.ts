import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  price: z.number().positive(),
  sku: z.string().min(1).max(50),
  stock: z.number().int().min(0),
  imageUrl: z.string().url().optional(),
  category: z.string().min(1).max(100).optional(),
  isActive: z.boolean(),
});

export type ProductInput = z.infer<typeof productSchema>;

export const validateProductData = (data: unknown): ProductInput => {
  return productSchema.parse(data);
};
