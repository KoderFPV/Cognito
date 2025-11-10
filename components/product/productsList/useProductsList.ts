import { useState, useEffect } from 'react';
import { IProduct } from '@/domain/product';
import { getProductsList, IProductsListResponse } from '@/repositories/api/products/productsListApiRepository';

export interface IProductsListState {
  products: IProduct[];
  isLoading: boolean;
  error: string;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export const useProductsList = (initialPageSize: number = 10) => {
  const [state, setState] = useState<IProductsListState>({
    products: [],
    isLoading: true,
    error: '',
    pagination: {
      page: 1,
      pageSize: initialPageSize,
      total: 0,
      totalPages: 0,
    },
  });

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: '' }));
        const response = await getProductsList(state.pagination.page, state.pagination.pageSize);

        setState((prev) => ({
          ...prev,
          products: response.data,
          pagination: response.pagination,
          isLoading: false,
        }));
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '';
        setState((prev) => ({
          ...prev,
          error: errorMessage,
          isLoading: false,
        }));
      }
    };

    loadProducts();
  }, [state.pagination.page, state.pagination.pageSize]);

  const setPage = (page: number) => {
    setState((prev) => ({
      ...prev,
      pagination: { ...prev.pagination, page },
    }));
  };

  const setPageSize = (pageSize: number) => {
    setState((prev) => ({
      ...prev,
      pagination: { ...prev.pagination, pageSize, page: 1 },
    }));
  };

  return {
    ...state,
    setPage,
    setPageSize,
  };
};
