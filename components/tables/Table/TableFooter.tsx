'use client';

import { useTranslations } from 'next-intl';
import styles from './Table.module.scss';

export interface ITableFooterProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export const TableFooter = ({
  currentPage,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: ITableFooterProps) => {
  const t = useTranslations('table.pagination');

  return (
    <div className={styles.footer}>
      <div className={styles.pagination}>
        <button
          className={styles.paginationButton}
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          aria-label="Previous page"
        >
          ← {t('previous')}
        </button>

        <div className={styles.pageInfo}>
          {t('page')} {currentPage} {t('of')} {totalPages}
        </div>

        <button
          className={styles.paginationButton}
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          aria-label="Next page"
        >
          {t('next')} →
        </button>
      </div>

      <div className={styles.pageSize}>
        <label htmlFor="page-size">{t('itemsPerPage')}:</label>
        <select
          id="page-size"
          value={pageSize}
          onChange={(e) => onPageSizeChange(parseInt(e.target.value))}
          className={styles.pageSizeSelect}
        >
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
      </div>
    </div>
  );
};
