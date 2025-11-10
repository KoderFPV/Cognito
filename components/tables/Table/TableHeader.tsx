import { SortOrder } from './Table.service';
import styles from './Table.module.scss';

export interface IColumn<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  width?: string;
  render?: (value: any, item: T) => React.ReactNode;
}

export interface ITableHeaderProps<T> {
  columns: IColumn<T>[];
  sortKey: keyof T | null;
  sortOrder: SortOrder;
  onSortChange: (columnKey: keyof T, isSortable?: boolean) => void;
}

const renderSortIcon = (isSorted: boolean, sortOrder: SortOrder): string => {
  if (!isSorted) return ' ↕️';
  return sortOrder === 'asc' ? ' ↑' : ' ↓';
};

export const TableHeader = <T extends Record<string, any>>({
  columns,
  sortKey,
  sortOrder,
  onSortChange,
}: ITableHeaderProps<T>) => {
  return (
    <thead>
      <tr>
        {columns.map((column) => (
          <th
            key={String(column.key)}
            onClick={() => onSortChange(column.key, column.sortable)}
            className={column.sortable ? styles.sortableHeader : undefined}
            style={column.width ? { width: column.width } : undefined}
          >
            {column.label}
            {column.sortable && renderSortIcon(sortKey === column.key, sortOrder)}
          </th>
        ))}
      </tr>
    </thead>
  );
};
