'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { TableHeader, IColumn } from './TableHeader';
import { TableBody } from './TableBody';
import { TableFooter } from './TableFooter';
import { sortData, calculatePagination, getPaginatedData, toggleSortOrder, clampPage } from './Table.service';
import { SortOrder } from './Table.service';
import styles from './Table.module.scss';

export interface ITableProps<T extends { _id: string }> {
  data: T[];
  columns: IColumn<T>[];
  isLoading?: boolean;
  onRowClick?: (item: T) => void;
  itemsPerPage?: number;
  onItemsPerPageChange?: (newCount: number) => void;
  emptyMessage?: string;
  loadingMessage?: string;
  renderCell?: (column: IColumn<T>, item: T) => React.ReactNode;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

export const Table = <T extends { _id: string }>({
  data,
  columns,
  isLoading = false,
  onRowClick,
  itemsPerPage = 10,
  onItemsPerPageChange,
  emptyMessage,
  loadingMessage,
  renderCell,
  pagination,
  onPageChange,
  onPageSizeChange,
}: ITableProps<T>) => {
  const t = useTranslations('table');
  const defaultEmptyMessage = emptyMessage || t('empty');
  const defaultLoadingMessage = loadingMessage || t('loading');

  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const isServerPaginated = pagination && onPageChange && onPageSizeChange;
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(itemsPerPage);

  const handleSort = (columnKey: keyof T, isSortable?: boolean) => {
    if (!isSortable) return;

    if (sortKey === columnKey) {
      setSortOrder(toggleSortOrder(sortOrder));
    } else {
      setSortKey(columnKey);
      setSortOrder('asc');
    }
    if (!isServerPaginated) {
      setCurrentPage(1);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (isServerPaginated) {
      onPageChange(newPage);
    } else {
      setCurrentPage(newPage);
    }
  };

  const handlePageSizeChange = (newSize: number) => {
    if (isServerPaginated) {
      onPageSizeChange(newSize);
    } else {
      setPageSize(newSize);
      setCurrentPage(1);
      onItemsPerPageChange?.(newSize);
    }
  };

  const sortedData = useMemo(() => sortData(data, sortKey, sortOrder), [data, sortKey, sortOrder]);

  let totalPages: number;
  let validPage: number;
  let paginatedData: T[];

  if (isServerPaginated) {
    totalPages = pagination.totalPages;
    validPage = pagination.page;
    paginatedData = sortedData;
  } else {
    totalPages = calculatePagination(sortedData.length, pageSize);
    validPage = clampPage(currentPage, totalPages);
    paginatedData = getPaginatedData(sortedData, pageSize, validPage);
  }

  return (
    <div className={styles.container}>
      <div className={styles.tableWrapper}>
        {isLoading ? (
          <div className={styles.loadingMessage}>{defaultLoadingMessage}</div>
        ) : data.length === 0 ? (
          <div className={styles.emptyMessage}>{defaultEmptyMessage}</div>
        ) : (
          <table className={styles.table}>
            <TableHeader columns={columns} sortKey={sortKey} sortOrder={sortOrder} onSortChange={handleSort} />
            <TableBody data={paginatedData} columns={columns} onRowClick={onRowClick} renderCell={renderCell} />
          </table>
        )}
      </div>

      {(data.length > 0 || (isServerPaginated && pagination.total > 0)) && (
        <TableFooter
          currentPage={validPage}
          totalPages={totalPages}
          pageSize={isServerPaginated ? pagination.pageSize : pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}
    </div>
  );
};

export type { IColumn } from './TableHeader';
export { Table as default };
