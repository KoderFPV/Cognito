export type SortOrder = 'asc' | 'desc';

export interface ISortState<T> {
  sortKey: keyof T | null;
  sortOrder: SortOrder;
}

export interface IPaginationState {
  currentPage: number;
  pageSize: number;
  totalPages: number;
}

export const calculatePagination = (dataLength: number, pageSize: number): number => {
  return Math.ceil(dataLength / pageSize);
};

export const getPaginatedData = <T,>(data: T[], pageSize: number, currentPage: number): T[] => {
  const startIndex = (currentPage - 1) * pageSize;
  return data.slice(startIndex, startIndex + pageSize);
};

export const sortData = <T extends Record<string, any>>(
  data: T[],
  sortKey: keyof T | null,
  sortOrder: SortOrder
): T[] => {
  if (!sortKey) return data;

  const sorted = [...data].sort((a, b) => {
    const aValue = a[sortKey];
    const bValue = b[sortKey];

    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      const comparison = aValue.toLowerCase().localeCompare(bValue.toLowerCase());
      return sortOrder === 'asc' ? comparison : -comparison;
    }

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    }

    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  return sorted;
};

export const toggleSortOrder = (currentOrder: SortOrder): SortOrder => {
  return currentOrder === 'asc' ? 'desc' : 'asc';
};

export const isValidPage = (page: number, totalPages: number): boolean => {
  return page >= 1 && page <= totalPages;
};

export const clampPage = (page: number, totalPages: number): number => {
  return Math.max(1, Math.min(page, totalPages || 1));
};
