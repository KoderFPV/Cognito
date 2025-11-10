import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Table, ITableProps } from './Table';

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      'empty': 'No data found',
      'loading': 'Loading...',
      'pagination.previous': 'Previous',
      'pagination.next': 'Next',
      'pagination.page': 'Page',
      'pagination.of': 'of',
      'pagination.itemsPerPage': 'Items per page',
    };
    return translations[key] || key;
  },
}));

interface TestItem {
  _id: string;
  name: string;
  price: number;
  stock: number;
}

describe('Table Component', () => {
  const mockData: TestItem[] = [
    { _id: '1', name: 'Product 1', price: 29.99, stock: 10 },
    { _id: '2', name: 'Product 2', price: 49.99, stock: 5 },
    { _id: '3', name: 'Product 3', price: 19.99, stock: 20 },
    { _id: '4', name: 'Product 4', price: 39.99, stock: 15 },
    { _id: '5', name: 'Product 5', price: 59.99, stock: 8 },
  ];

  const mockColumns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'price', label: 'Price', sortable: true },
    { key: 'stock', label: 'Stock', sortable: true },
  ];

  const defaultProps: ITableProps<TestItem> = {
    data: mockData,
    columns: mockColumns,
    isLoading: false,
  };

  it('should render table with data', () => {
    render(<Table {...defaultProps} />);

    expect(screen.getByText('Product 1')).toBeInTheDocument();
    expect(screen.getByText('Product 2')).toBeInTheDocument();
    expect(screen.getByText('29.99')).toBeInTheDocument();
    expect(screen.getByText('49.99')).toBeInTheDocument();
  });

  it('should render column headers', () => {
    render(<Table {...defaultProps} />);

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Price')).toBeInTheDocument();
    expect(screen.getByText('Stock')).toBeInTheDocument();
  });

  it('should show loading message when isLoading is true', () => {
    render(<Table {...defaultProps} isLoading={true} />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should show empty message when data is empty', () => {
    render(<Table {...defaultProps} data={[]} />);

    expect(screen.getByText('No data found')).toBeInTheDocument();
  });

  it('should show custom empty message when provided', () => {
    render(<Table {...defaultProps} data={[]} emptyMessage="No products available" />);

    expect(screen.getByText('No products available')).toBeInTheDocument();
  });

  it('should show custom loading message when provided', () => {
    render(<Table {...defaultProps} isLoading={true} loadingMessage="Fetching products..." />);

    expect(screen.getByText('Fetching products...')).toBeInTheDocument();
  });

  it('should paginate data correctly', () => {
    render(<Table {...defaultProps} itemsPerPage={2} />);

    expect(screen.getByText('Product 1')).toBeInTheDocument();
    expect(screen.getByText('Product 2')).toBeInTheDocument();
    expect(screen.queryByText('Product 3')).not.toBeInTheDocument();
  });

  it('should change page when next button is clicked', async () => {
    render(<Table {...defaultProps} itemsPerPage={2} />);

    const nextButton = screen.getAllByRole('button').find((btn) => btn.textContent?.includes('Next'));
    if (nextButton) {
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText('Product 3')).toBeInTheDocument();
        expect(screen.queryByText('Product 1')).not.toBeInTheDocument();
      });
    }
  });

  it('should change page when previous button is clicked', async () => {
    render(<Table {...defaultProps} itemsPerPage={2} />);

    const nextButton = screen.getAllByRole('button').find((btn) => btn.textContent?.includes('Next'));
    if (nextButton) {
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText('Product 3')).toBeInTheDocument();
      });

      const prevButton = screen.getAllByRole('button').find((btn) => btn.textContent?.includes('Previous'));
      if (prevButton) {
        fireEvent.click(prevButton);

        await waitFor(() => {
          expect(screen.getByText('Product 1')).toBeInTheDocument();
          expect(screen.queryByText('Product 3')).not.toBeInTheDocument();
        });
      }
    }
  });

  it('should disable previous button on first page', () => {
    render(<Table {...defaultProps} itemsPerPage={2} />);

    const prevButton = screen.getAllByRole('button').find((btn) => btn.textContent?.includes('Previous')) as HTMLButtonElement;
    expect(prevButton?.disabled).toBe(true);
  });

  it('should disable next button on last page', () => {
    render(<Table {...defaultProps} itemsPerPage={10} />);

    const nextButton = screen.getAllByRole('button').find((btn) => btn.textContent?.includes('Next')) as HTMLButtonElement;
    expect(nextButton?.disabled).toBe(true);
  });

  it('should call onRowClick when row is clicked', () => {
    const onRowClick = jest.fn();
    render(<Table {...defaultProps} onRowClick={onRowClick} />);

    const rows = screen.getAllByRole('row');
    if (rows.length > 1) {
      fireEvent.click(rows[1]);
      expect(onRowClick).toHaveBeenCalled();
    }
  });

  it('should sort data in ascending order when column is clicked', async () => {
    render(<Table {...defaultProps} />);

    const nameHeader = screen.getByText('Name');
    fireEvent.click(nameHeader);

    await waitFor(() => {
      const rows = screen.getAllByRole('row');
      expect(rows[1].textContent).toContain('Product 1');
    });
  });

  it('should sort data in descending order when column is clicked twice', async () => {
    render(<Table {...defaultProps} />);

    const nameHeader = screen.getByText('Name');
    fireEvent.click(nameHeader);

    await waitFor(() => {
      fireEvent.click(nameHeader);
    });

    await waitFor(() => {
      const rows = screen.getAllByRole('row');
      expect(rows[1].textContent).toContain('Product 5');
    });
  });

  it('should not sort when clicking non-sortable column', async () => {
    const nonSortableColumns = [
      { key: 'name', label: 'Name', sortable: false },
      { key: 'price', label: 'Price', sortable: true },
    ];

    render(<Table {...defaultProps} columns={nonSortableColumns} />);

    const nameHeader = screen.getByText('Name');
    fireEvent.click(nameHeader);

    await waitFor(() => {
      expect(screen.getByText('Product 1')).toBeInTheDocument();
    });
  });

  it('should change page size when dropdown is changed', async () => {
    render(<Table {...defaultProps} itemsPerPage={2} />);

    const select = screen.getByDisplayValue('2') as HTMLSelectElement;
    fireEvent.change(select, { target: { value: '25' } });

    await waitFor(() => {
      expect(screen.getByText('Product 5')).toBeInTheDocument();
    });
  });

  it('should call onItemsPerPageChange when page size changes', async () => {
    const onItemsPerPageChange = jest.fn();
    render(<Table {...defaultProps} itemsPerPage={2} onItemsPerPageChange={onItemsPerPageChange} />);

    const select = screen.getByDisplayValue('2') as HTMLSelectElement;
    fireEvent.change(select, { target: { value: '10' } });

    await waitFor(() => {
      expect(onItemsPerPageChange).toHaveBeenCalledWith(10);
    });
  });

  it('should display pagination info correctly', () => {
    render(<Table {...defaultProps} itemsPerPage={2} />);

    expect(screen.getByText(/Page 1 of 3/)).toBeInTheDocument();
  });

  it('should render custom cell content when renderCell is provided', () => {
    const renderCell = (column: any, item: TestItem) => {
      if (column.key === 'price') {
        return `$${item.price}`;
      }
      return item[column.key as keyof TestItem];
    };

    render(<Table {...defaultProps} renderCell={renderCell} />);

    expect(screen.getByText('$29.99')).toBeInTheDocument();
    expect(screen.getByText('$49.99')).toBeInTheDocument();
  });

  it('should handle sorting with numbers correctly', async () => {
    render(<Table {...defaultProps} />);

    const priceHeader = screen.getByText('Price');
    fireEvent.click(priceHeader);

    await waitFor(() => {
      const rows = screen.getAllByRole('row');
      expect(rows[1].textContent).toContain('19.99');
    });
  });

  it('should reset to page 1 when sorting changes', async () => {
    render(<Table {...defaultProps} itemsPerPage={2} />);

    const nextButton = screen.getAllByRole('button').find((btn) => btn.textContent?.includes('Next'));
    if (nextButton) {
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText('Product 3')).toBeInTheDocument();
      });

      const nameHeader = screen.getByText('Name');
      fireEvent.click(nameHeader);

      await waitFor(() => {
        expect(screen.getByText(/Page 1 of 3/)).toBeInTheDocument();
      });
    }
  });

  it('should handle empty columns array', () => {
    render(<Table {...defaultProps} columns={[]} />);

    expect(screen.getByText('No data found')).toBeInTheDocument();
  });

  it('should render footer only when data is not empty', () => {
    const { rerender } = render(<Table {...defaultProps} itemsPerPage={2} />);

    let footers = screen.queryAllByRole('button');
    expect(footers.length).toBeGreaterThan(0);

    rerender(<Table {...defaultProps} data={[]} itemsPerPage={2} />);

    footers = screen.queryAllByRole('button');
    expect(footers.length).toBe(0);
  });

  it('should maintain sort state when changing pages', async () => {
    render(<Table {...defaultProps} itemsPerPage={2} />);

    const nameHeader = screen.getByText('Name');
    fireEvent.click(nameHeader);

    await waitFor(() => {
      const rows = screen.getAllByRole('row');
      expect(rows[1].textContent).toContain('Product 1');
    });

    const nextButton = screen.getAllByRole('button').find((btn) => btn.textContent?.includes('Next'));
    if (nextButton) {
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText('Product 3')).toBeInTheDocument();
      });
    }
  });

  it('should clamp page when page exceeds total pages', () => {
    const { rerender } = render(<Table {...defaultProps} itemsPerPage={2} />);

    const nextButton = screen.getAllByRole('button').find((btn) => btn.textContent?.includes('Next'));
    if (nextButton) {
      fireEvent.click(nextButton);

      rerender(<Table {...defaultProps} data={mockData.slice(0, 2)} itemsPerPage={2} />);

      expect(screen.getByText(/Page 1 of 1/)).toBeInTheDocument();
    }
  });
});
