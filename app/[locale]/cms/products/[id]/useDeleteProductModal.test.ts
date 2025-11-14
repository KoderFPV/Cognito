import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDeleteProductModal } from './useDeleteProductModal';

describe('useDeleteProductModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with modal closed and no error', () => {
    const { result } = renderHook(() => useDeleteProductModal());

    expect(result.current.isDeleteModalOpen).toBe(false);
    expect(result.current.deleteError).toBeNull();
  });

  it('should open modal and clear error on handleDeleteClick', () => {
    const { result } = renderHook(() => useDeleteProductModal());

    act(() => {
      result.current.handleDeleteError('Previous error');
    });

    expect(result.current.deleteError).toBe('Previous error');

    act(() => {
      result.current.handleDeleteClick();
    });

    expect(result.current.isDeleteModalOpen).toBe(true);
    expect(result.current.deleteError).toBeNull();
  });

  it('should close modal and clear error on handleCloseDeleteModal', () => {
    const { result } = renderHook(() => useDeleteProductModal());

    act(() => {
      result.current.handleDeleteClick();
    });

    expect(result.current.isDeleteModalOpen).toBe(true);

    act(() => {
      result.current.handleDeleteError('Delete failed');
    });

    expect(result.current.deleteError).toBe('Delete failed');

    act(() => {
      result.current.handleCloseDeleteModal();
    });

    expect(result.current.isDeleteModalOpen).toBe(false);
    expect(result.current.deleteError).toBeNull();
  });

  it('should close modal and clear error on handleDeleteSuccess', () => {
    const { result } = renderHook(() => useDeleteProductModal());

    act(() => {
      result.current.handleDeleteClick();
    });

    expect(result.current.isDeleteModalOpen).toBe(true);

    act(() => {
      result.current.handleDeleteSuccess();
    });

    expect(result.current.isDeleteModalOpen).toBe(false);
    expect(result.current.deleteError).toBeNull();
  });

  it('should set error on handleDeleteError without changing modal state', () => {
    const { result } = renderHook(() => useDeleteProductModal());

    act(() => {
      result.current.handleDeleteClick();
    });

    expect(result.current.isDeleteModalOpen).toBe(true);

    const errorMessage = 'Failed to delete product';
    act(() => {
      result.current.handleDeleteError(errorMessage);
    });

    expect(result.current.deleteError).toBe(errorMessage);
    expect(result.current.isDeleteModalOpen).toBe(true);
  });

  it('should handle multiple error updates', () => {
    const { result } = renderHook(() => useDeleteProductModal());

    act(() => {
      result.current.handleDeleteClick();
    });

    act(() => {
      result.current.handleDeleteError('First error');
    });

    expect(result.current.deleteError).toBe('First error');

    act(() => {
      result.current.handleDeleteError('Second error');
    });

    expect(result.current.deleteError).toBe('Second error');
  });

  it('should clear error when opening modal even if error was set', () => {
    const { result } = renderHook(() => useDeleteProductModal());

    act(() => {
      result.current.handleDeleteError('Initial error');
    });

    expect(result.current.deleteError).toBe('Initial error');
    expect(result.current.isDeleteModalOpen).toBe(false);

    act(() => {
      result.current.handleDeleteClick();
    });

    expect(result.current.isDeleteModalOpen).toBe(true);
    expect(result.current.deleteError).toBeNull();
  });

  it('should allow reopening modal after closing', () => {
    const { result } = renderHook(() => useDeleteProductModal());

    act(() => {
      result.current.handleDeleteClick();
    });

    expect(result.current.isDeleteModalOpen).toBe(true);

    act(() => {
      result.current.handleCloseDeleteModal();
    });

    expect(result.current.isDeleteModalOpen).toBe(false);

    act(() => {
      result.current.handleDeleteClick();
    });

    expect(result.current.isDeleteModalOpen).toBe(true);
  });

  it('should handle modal close followed by error without affecting state', () => {
    const { result } = renderHook(() => useDeleteProductModal());

    act(() => {
      result.current.handleDeleteClick();
    });

    act(() => {
      result.current.handleCloseDeleteModal();
    });

    expect(result.current.isDeleteModalOpen).toBe(false);
    expect(result.current.deleteError).toBeNull();

    act(() => {
      result.current.handleDeleteError('Error while closed');
    });

    expect(result.current.deleteError).toBe('Error while closed');
    expect(result.current.isDeleteModalOpen).toBe(false);
  });
});
