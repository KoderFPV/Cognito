import { z } from 'zod';
import { initZodI18n } from '@/services/validation/validation.service';

export const productSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  price: z.number().positive(),
  sku: z.string().min(1).max(50),
  stock: z.number().int().min(0),
  imageUrl: z.string().url().optional(),
  category: z.string().min(1).max(100),
  isActive: z.boolean(),
});

export type ProductInput = z.infer<typeof productSchema>;

export const validateProductData = async (
  data: unknown,
  locale: string
): Promise<ProductInput> => {
  await initZodI18n(locale);
  return productSchema.parse(data);
};
