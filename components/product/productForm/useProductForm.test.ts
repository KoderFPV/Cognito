import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useProductForm } from './useProductForm';

const mockPush = vi.fn();
const mockRouter = {
  push: mockPush,
  replace: vi.fn(),
  refresh: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  prefetch: vi.fn(),
};

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  useParams: () => ({ locale: 'en' }),
}));

vi.mock('@/services/product/productValidation.service', () => ({
  validateProductData: vi.fn((data) => Promise.resolve(data)),
}));

vi.mock('@/repositories/api/products/productsApiRepository', () => ({
  createProductViaApi: vi.fn(() => Promise.resolve({ message: 'created' })),
}));

describe('useProductForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default field values', () => {
    const { result } = renderHook(() => useProductForm());

    expect(result.current.fields.name.value).toBe('');
    expect(result.current.fields.description.value).toBe('');
    expect(result.current.fields.price.value).toBe('');
    expect(result.current.fields.sku.value).toBe('');
    expect(result.current.fields.stock.value).toBe('');
    expect(result.current.fields.category.value).toBe('');
    expect(result.current.fields.isActive.value).toBe(true);
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.submitError).toBe('');
    expect(result.current.submitSuccess).toBe(false);
  });

  it('should initialize image upload', () => {
    const { result } = renderHook(() => useProductForm());

    expect(result.current.imageUpload).toBeDefined();
    expect(result.current.imageUpload.file).toBe(null);
    expect(result.current.imageUpload.preview).toBe('');
    expect(result.current.imageUpload.error).toBe('');
  });

  it('should handle cancel and navigate to products page', () => {
    const { result } = renderHook(() => useProductForm());

    act(() => {
      result.current.handleCancel();
    });

    expect(mockPush).toHaveBeenCalledWith('/en/cms/products');
  });

  it('should set validation errors for empty required fields on submit', async () => {
    const { result } = renderHook(() => useProductForm());

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() } as unknown as React.FormEvent);
    });

    expect(result.current.fields.name.error).toBe('errors.nameRequired');
    expect(result.current.fields.description.error).toBe('errors.descriptionRequired');
    expect(result.current.fields.price.error).toBe('errors.priceRequired');
    expect(result.current.fields.sku.error).toBe('errors.skuRequired');
    expect(result.current.fields.stock.error).toBe('errors.stockRequired');
    expect(result.current.fields.category.error).toBe('errors.categoryRequired');
  });

  it('should validate price as positive number', async () => {
    const { result } = renderHook(() => useProductForm());

    act(() => {
      result.current.fields.name.setValue('Product');
      result.current.fields.description.setValue('Description');
      result.current.fields.price.setValue('-10');
      result.current.fields.sku.setValue('SKU-001');
      result.current.fields.stock.setValue('10');
    });

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() } as unknown as React.FormEvent);
    });

    expect(result.current.fields.price.error).toBe('errors.priceInvalid');
  });

  it('should validate price as number', async () => {
    const { result } = renderHook(() => useProductForm());

    act(() => {
      result.current.fields.name.setValue('Product');
      result.current.fields.description.setValue('Description');
      result.current.fields.price.setValue('not-a-number');
      result.current.fields.sku.setValue('SKU-001');
      result.current.fields.stock.setValue('10');
    });

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() } as unknown as React.FormEvent);
    });

    expect(result.current.fields.price.error).toBe('errors.priceInvalid');
  });

  it('should validate stock as non-negative integer', async () => {
    const { result } = renderHook(() => useProductForm());

    act(() => {
      result.current.fields.name.setValue('Product');
      result.current.fields.description.setValue('Description');
      result.current.fields.price.setValue('99.99');
      result.current.fields.sku.setValue('SKU-001');
      result.current.fields.stock.setValue('-5');
    });

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() } as unknown as React.FormEvent);
    });

    expect(result.current.fields.stock.error).toBe('errors.stockInvalid');
  });

  it('should set all fields as touched on submit', async () => {
    const { result } = renderHook(() => useProductForm());

    expect(result.current.fields.name.touched).toBe(false);
    expect(result.current.fields.description.touched).toBe(false);
    expect(result.current.fields.price.touched).toBe(false);
    expect(result.current.fields.sku.touched).toBe(false);
    expect(result.current.fields.stock.touched).toBe(false);
    expect(result.current.fields.category.touched).toBe(false);

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() } as unknown as React.FormEvent);
    });

    expect(result.current.fields.name.touched).toBe(true);
    expect(result.current.fields.description.touched).toBe(true);
    expect(result.current.fields.price.touched).toBe(true);
    expect(result.current.fields.sku.touched).toBe(true);
    expect(result.current.fields.stock.touched).toBe(true);
    expect(result.current.fields.category.touched).toBe(true);
  });

  it('should handle ZodError on submit', async () => {
    const { validateProductData } = await import('@/services/product/productValidation.service');
    const { ZodError } = await import('zod');

    vi.mocked(validateProductData).mockImplementation(() => {
      return Promise.reject(new ZodError([]));
    });

    const { result } = renderHook(() => useProductForm());

    act(() => {
      result.current.fields.name.setValue('Product');
      result.current.fields.description.setValue('Description');
      result.current.fields.price.setValue('99.99');
      result.current.fields.sku.setValue('SKU-001');
      result.current.fields.stock.setValue('10');
      result.current.fields.category.setValue('Electronics');
    });

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() } as unknown as React.FormEvent);
    });

    expect(result.current.submitError).toBe('errors.validationFailed');
    expect(result.current.isSubmitting).toBe(false);
  });

  it('should handle generic error on submit', async () => {
    const { validateProductData } = await import('@/services/product/productValidation.service');

    vi.mocked(validateProductData).mockImplementation(() => {
      return Promise.reject(new Error('Generic error'));
    });

    const { result } = renderHook(() => useProductForm());

    act(() => {
      result.current.fields.name.setValue('Product');
      result.current.fields.description.setValue('Description');
      result.current.fields.price.setValue('99.99');
      result.current.fields.sku.setValue('SKU-001');
      result.current.fields.stock.setValue('10');
      result.current.fields.category.setValue('Electronics');
    });

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() } as unknown as React.FormEvent);
    });

    expect(result.current.submitError).toBe('errors.submitFailed');
    expect(result.current.isSubmitting).toBe(false);
  });

  it('should submit successfully with valid data', async () => {
    vi.useFakeTimers();

    const { validateProductData } = await import('@/services/product/productValidation.service');
    vi.mocked(validateProductData).mockImplementation((data) => Promise.resolve(data as any));

    const { result } = renderHook(() => useProductForm());

    act(() => {
      result.current.fields.name.setValue('Product');
      result.current.fields.description.setValue('Description');
      result.current.fields.price.setValue('99.99');
      result.current.fields.sku.setValue('SKU-001');
      result.current.fields.stock.setValue('10');
      result.current.fields.category.setValue('Electronics');
    });

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() } as unknown as React.FormEvent);
    });

    expect(result.current.submitSuccess).toBe(true);
    expect(result.current.submitError).toBe('');

    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(mockPush).toHaveBeenCalledWith('/en/cms/products');

    vi.useRealTimers();
  });

  it('should not submit when validation fails', async () => {
    const { validateProductData } = await import('@/services/product/productValidation.service');
    const mockValidate = vi.mocked(validateProductData);

    const { result } = renderHook(() => useProductForm());

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() } as unknown as React.FormEvent);
    });

    expect(mockValidate).not.toHaveBeenCalled();
    expect(result.current.isSubmitting).toBe(false);
  });
});
