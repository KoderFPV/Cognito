import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DeleteProductModal } from './DeleteProductModal';

const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

vi.mock('@/repositories/api/products/productsApiRepository', () => ({
  deleteProductViaApi: vi.fn(),
}));

vi.mock('@/template/components/modals/DeleteProductModal/DeleteProductModalTemplate', () => ({
  DeleteProductModalTemplate: ({ isOpen, productName, isDeleting, onConfirm, onCancel }: any) => {
    if (!isOpen) return null;

    return (
      <div data-testid="delete-modal">
        <p>{productName}</p>
        <button data-testid="confirm-button" onClick={onConfirm} disabled={isDeleting}>
          Delete
        </button>
        <button data-testid="cancel-button" onClick={onCancel} disabled={isDeleting}>
          Cancel
        </button>
        {isDeleting && <span data-testid="loading">Deleting...</span>}
      </div>
    );
  },
}));

describe('DeleteProductModal', () => {
  const mockOnClose = vi.fn();
  const mockOnDeleteSuccess = vi.fn();
  const mockOnDeleteError = vi.fn();
  const defaultProps = {
    isOpen: true,
    productId: '507f1f77bcf86cd799439011',
    productName: 'Test Product',
    locale: 'en',
    onClose: mockOnClose,
    onDeleteSuccess: mockOnDeleteSuccess,
    onDeleteError: mockOnDeleteError,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render modal when isOpen is false', () => {
    render(<DeleteProductModal {...defaultProps} isOpen={false} />);

    expect(screen.queryByTestId('delete-modal')).not.toBeInTheDocument();
  });

  it('should render modal when isOpen is true', () => {
    render(<DeleteProductModal {...defaultProps} />);

    expect(screen.getByTestId('delete-modal')).toBeInTheDocument();
    expect(screen.getByText('Test Product')).toBeInTheDocument();
  });

  it('should call onClose when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(<DeleteProductModal {...defaultProps} />);

    const cancelButton = screen.getByTestId('cancel-button');
    await user.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledOnce();
  });

  it('should call deleteProductViaApi with correct productId on confirm', async () => {
    const { deleteProductViaApi } = await import('@/repositories/api/products/productsApiRepository');
    const user = userEvent.setup();
    render(<DeleteProductModal {...defaultProps} />);

    const confirmButton = screen.getByTestId('confirm-button');
    await user.click(confirmButton);

    expect(deleteProductViaApi).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
  });

  it('should call onDeleteSuccess on successful deletion', async () => {
    const { deleteProductViaApi } = await import('@/repositories/api/products/productsApiRepository');
    vi.mocked(deleteProductViaApi).mockResolvedValue({ message: 'Product deleted' });

    const user = userEvent.setup();
    render(<DeleteProductModal {...defaultProps} />);

    const confirmButton = screen.getByTestId('confirm-button');
    await user.click(confirmButton);

    await waitFor(() => {
      expect(mockOnDeleteSuccess).toHaveBeenCalledOnce();
    });
  });

  it('should navigate to products list after successful deletion', async () => {
    const { deleteProductViaApi } = await import('@/repositories/api/products/productsApiRepository');
    vi.mocked(deleteProductViaApi).mockResolvedValue({ message: 'Product deleted' });

    const user = userEvent.setup();
    render(<DeleteProductModal {...defaultProps} locale="en" />);

    const confirmButton = screen.getByTestId('confirm-button');
    await user.click(confirmButton);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/en/cms/products');
    });
  });

  it('should navigate to correct locale path on deletion', async () => {
    const { deleteProductViaApi } = await import('@/repositories/api/products/productsApiRepository');
    vi.mocked(deleteProductViaApi).mockResolvedValue({ message: 'Product deleted' });

    const user = userEvent.setup();
    render(<DeleteProductModal {...defaultProps} locale="pl" />);

    const confirmButton = screen.getByTestId('confirm-button');
    await user.click(confirmButton);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/pl/cms/products');
    });
  });

  it('should call onDeleteError with error message on deletion failure', async () => {
    const { deleteProductViaApi } = await import('@/repositories/api/products/productsApiRepository');
    const errorMessage = 'Network error';
    vi.mocked(deleteProductViaApi).mockRejectedValue(new Error(errorMessage));

    const user = userEvent.setup();
    render(<DeleteProductModal {...defaultProps} />);

    const confirmButton = screen.getByTestId('confirm-button');
    await user.click(confirmButton);

    await waitFor(() => {
      expect(mockOnDeleteError).toHaveBeenCalledWith(errorMessage);
    });
  });

  it('should handle non-Error objects thrown during deletion', async () => {
    const { deleteProductViaApi } = await import('@/repositories/api/products/productsApiRepository');
    vi.mocked(deleteProductViaApi).mockRejectedValue('String error');

    const user = userEvent.setup();
    render(<DeleteProductModal {...defaultProps} />);

    const confirmButton = screen.getByTestId('confirm-button');
    await user.click(confirmButton);

    await waitFor(() => {
      expect(mockOnDeleteError).toHaveBeenCalledWith('Failed to delete product');
    });
  });

  it('should show loading state during deletion', async () => {
    const { deleteProductViaApi } = await import('@/repositories/api/products/productsApiRepository');
    let resolveDelete: any;
    const deletePromise = new Promise((resolve) => {
      resolveDelete = resolve;
    });
    vi.mocked(deleteProductViaApi).mockReturnValue(deletePromise as any);

    const user = userEvent.setup();
    render(<DeleteProductModal {...defaultProps} />);

    const confirmButton = screen.getByTestId('confirm-button');
    await user.click(confirmButton);

    expect(screen.getByTestId('loading')).toBeInTheDocument();
    expect(screen.getByTestId('confirm-button')).toBeDisabled();
    expect(screen.getByTestId('cancel-button')).toBeDisabled();

    resolveDelete({ message: 'Product deleted' });

    await waitFor(() => {
      expect(mockOnDeleteSuccess).toHaveBeenCalledOnce();
    });
  });

  it('should re-enable buttons after deletion error', async () => {
    const { deleteProductViaApi } = await import('@/repositories/api/products/productsApiRepository');
    vi.mocked(deleteProductViaApi).mockRejectedValue(new Error('Delete failed'));

    const user = userEvent.setup();
    const { rerender } = render(<DeleteProductModal {...defaultProps} />);

    const confirmButton = screen.getByTestId('confirm-button');
    await user.click(confirmButton);

    await waitFor(() => {
      expect(mockOnDeleteError).toHaveBeenCalled();
    });

    rerender(<DeleteProductModal {...defaultProps} />);

    expect(screen.getByTestId('confirm-button')).not.toBeDisabled();
    expect(screen.getByTestId('cancel-button')).not.toBeDisabled();
  });

  it('should not navigate on deletion error', async () => {
    const { deleteProductViaApi } = await import('@/repositories/api/products/productsApiRepository');
    vi.mocked(deleteProductViaApi).mockRejectedValue(new Error('Delete failed'));

    const user = userEvent.setup();
    render(<DeleteProductModal {...defaultProps} />);

    const confirmButton = screen.getByTestId('confirm-button');
    await user.click(confirmButton);

    await waitFor(() => {
      expect(mockOnDeleteError).toHaveBeenCalled();
    });

    expect(mockPush).not.toHaveBeenCalled();
  });

  it('should handle multiple deletion attempts', async () => {
    const { deleteProductViaApi } = await import('@/repositories/api/products/productsApiRepository');
    vi.mocked(deleteProductViaApi).mockRejectedValue(new Error('First attempt failed'));

    const user = userEvent.setup();
    const { rerender } = render(<DeleteProductModal {...defaultProps} />);

    const confirmButton = screen.getByTestId('confirm-button');
    await user.click(confirmButton);

    await waitFor(() => {
      expect(mockOnDeleteError).toHaveBeenCalledTimes(1);
    });

    vi.mocked(deleteProductViaApi).mockResolvedValue({ message: 'Deleted' });

    rerender(<DeleteProductModal {...defaultProps} />);

    const newConfirmButton = screen.getByTestId('confirm-button');
    await user.click(newConfirmButton);

    await waitFor(() => {
      expect(mockOnDeleteSuccess).toHaveBeenCalledOnce();
    });
  });

  it('should display product name in modal', () => {
    render(<DeleteProductModal {...defaultProps} productName="Sample Product" />);

    expect(screen.getByText('Sample Product')).toBeInTheDocument();
  });
});
