import { IColumn } from './TableHeader';
import styles from './Table.module.scss';

export interface ITableBodyProps<T extends { _id: string }> {
  data: T[];
  columns: IColumn<T>[];
  onRowClick?: (item: T) => void;
  renderCell?: (column: IColumn<T>, item: T) => React.ReactNode;
}

export const TableBody = <T extends { _id: string }>({
  data,
  columns,
  onRowClick,
  renderCell,
}: ITableBodyProps<T>) => {
  return (
    <tbody>
      {data.map((item) => (
        <tr
          key={item._id}
          className={styles.row}
          onClick={() => onRowClick?.(item)}
          role={onRowClick ? 'button' : undefined}
          tabIndex={onRowClick ? 0 : undefined}
          onKeyDown={(e) => {
            if (onRowClick && (e.key === 'Enter' || e.key === ' ')) {
              onRowClick(item);
            }
          }}
        >
          {columns.map((column) => (
            <td key={String(column.key)}>
              {renderCell ? renderCell(column, item) : String(item[column.key] ?? '')}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
};
