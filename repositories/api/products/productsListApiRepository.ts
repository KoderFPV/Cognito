import { IProduct } from '@/domain/product';

export interface IProductsListResponse {
  data: IProduct[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export const getProductsList = async (page: number, pageSize: number): Promise<IProductsListResponse> => {
  const response = await fetch(`/api/products/list?page=${page}&pageSize=${pageSize}`);

  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }

  return response.json();
};
