import { useState } from 'react';

export interface IImageUpload {
  file: File | null;
  preview: string;
  error: string;
  setFile: (file: File | null) => void;
  setPreview: (preview: string) => void;
  setError: (error: string) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  reset: () => void;
}

export const useImageUpload = (
  maxSizeMB: number,
  allowedTypes: string[]
): IImageUpload => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    if (!allowedTypes.includes(selectedFile.type)) {
      setError('Invalid file type');
      setFile(null);
      setPreview('');
      return;
    }

    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (selectedFile.size > maxSizeBytes) {
      setError(`File size must be less than ${maxSizeMB}MB`);
      setFile(null);
      setPreview('');
      return;
    }

    setError('');
    setFile(selectedFile);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const reset = () => {
    setFile(null);
    setPreview('');
    setError('');
  };

  return {
    file,
    preview,
    error,
    setFile,
    setPreview,
    setError,
    handleFileChange,
    reset,
  };
};
