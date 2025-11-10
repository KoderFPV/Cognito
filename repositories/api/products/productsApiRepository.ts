import { IProductCreateInput } from '@/domain/product';

export interface IProductCreationResponse {
  message: string;
}

export const createProductViaApi = async (
  data: IProductCreateInput
): Promise<IProductCreationResponse> => {
  const response = await fetch('/api/products', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to create product');
  }

  return response.json();
};
