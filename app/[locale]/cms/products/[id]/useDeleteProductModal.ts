'use client';

import { useState } from 'react';

export const useDeleteProductModal = () => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
    setDeleteError(null);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeleteError(null);
  };

  const handleDeleteSuccess = () => {
    setIsDeleteModalOpen(false);
    setDeleteError(null);
  };

  const handleDeleteError = (error: string) => {
    setDeleteError(error);
  };

  return {
    isDeleteModalOpen,
    deleteError,
    handleDeleteClick,
    handleCloseDeleteModal,
    handleDeleteSuccess,
    handleDeleteError,
  };
};
