import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useImageUpload } from './useImageUpload';

describe('useImageUpload', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with empty values', () => {
    const { result } = renderHook(() =>
      useImageUpload(5, ['image/jpeg', 'image/png'])
    );

    expect(result.current.file).toBe(null);
    expect(result.current.preview).toBe('');
    expect(result.current.error).toBe('');
  });

  it('should set file directly', () => {
    const { result } = renderHook(() =>
      useImageUpload(5, ['image/jpeg', 'image/png'])
    );

    const mockFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' });

    act(() => {
      result.current.setFile(mockFile);
    });

    expect(result.current.file).toBe(mockFile);
  });

  it('should set preview directly', () => {
    const { result } = renderHook(() =>
      useImageUpload(5, ['image/jpeg', 'image/png'])
    );

    act(() => {
      result.current.setPreview('data:image/jpeg;base64,abc123');
    });

    expect(result.current.preview).toBe('data:image/jpeg;base64,abc123');
  });

  it('should set error directly', () => {
    const { result } = renderHook(() =>
      useImageUpload(5, ['image/jpeg', 'image/png'])
    );

    act(() => {
      result.current.setError('Custom error message');
    });

    expect(result.current.error).toBe('Custom error message');
  });

  it('should reject file with invalid type', () => {
    const { result } = renderHook(() =>
      useImageUpload(5, ['image/jpeg', 'image/png'])
    );

    const mockFile = new File(['content'], 'test.gif', { type: 'image/gif' });
    const mockEvent = {
      target: {
        files: [mockFile],
      },
    } as unknown as React.ChangeEvent<HTMLInputElement>;

    act(() => {
      result.current.handleFileChange(mockEvent);
    });

    expect(result.current.error).toBe('Invalid file type');
    expect(result.current.file).toBe(null);
    expect(result.current.preview).toBe('');
  });

  it('should reject file exceeding max size', () => {
    const { result } = renderHook(() =>
      useImageUpload(1, ['image/jpeg', 'image/png'])
    );

    const largeContent = new Array(2 * 1024 * 1024).fill('a').join('');
    const mockFile = new File([largeContent], 'test.jpg', {
      type: 'image/jpeg',
    });
    const mockEvent = {
      target: {
        files: [mockFile],
      },
    } as unknown as React.ChangeEvent<HTMLInputElement>;

    act(() => {
      result.current.handleFileChange(mockEvent);
    });

    expect(result.current.error).toBe('File size must be less than 1MB');
    expect(result.current.file).toBe(null);
    expect(result.current.preview).toBe('');
  });

  it('should handle empty file selection', () => {
    const { result } = renderHook(() =>
      useImageUpload(5, ['image/jpeg', 'image/png'])
    );

    const mockEvent = {
      target: {
        files: [],
      },
    } as unknown as React.ChangeEvent<HTMLInputElement>;

    act(() => {
      result.current.handleFileChange(mockEvent);
    });

    expect(result.current.file).toBe(null);
    expect(result.current.preview).toBe('');
    expect(result.current.error).toBe('');
  });

  it('should accept valid file', async () => {
    const { result } = renderHook(() =>
      useImageUpload(5, ['image/jpeg', 'image/png'])
    );

    const mockFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' });

    const mockReadAsDataURL = vi.fn(function (this: FileReader) {
      if (this.onloadend) {
        Object.defineProperty(this, 'result', {
          value: 'data:image/jpeg;base64,abc123',
          writable: false,
        });
        this.onloadend({} as ProgressEvent<FileReader>);
      }
    });

    global.FileReader = vi.fn(function (this: FileReader) {
      this.readAsDataURL = mockReadAsDataURL;
      return this;
    }) as unknown as typeof FileReader;

    const mockEvent = {
      target: {
        files: [mockFile],
      },
    } as unknown as React.ChangeEvent<HTMLInputElement>;

    await act(async () => {
      result.current.handleFileChange(mockEvent);
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.error).toBe('');
    expect(result.current.file).toBe(mockFile);
    expect(result.current.preview).toBe('data:image/jpeg;base64,abc123');
  });

  it('should reset all values', () => {
    const { result } = renderHook(() =>
      useImageUpload(5, ['image/jpeg', 'image/png'])
    );

    const mockFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' });

    act(() => {
      result.current.setFile(mockFile);
      result.current.setPreview('data:image/jpeg;base64,abc123');
      result.current.setError('Some error');
    });

    expect(result.current.file).toBe(mockFile);
    expect(result.current.preview).toBe('data:image/jpeg;base64,abc123');
    expect(result.current.error).toBe('Some error');

    act(() => {
      result.current.reset();
    });

    expect(result.current.file).toBe(null);
    expect(result.current.preview).toBe('');
    expect(result.current.error).toBe('');
  });

  it('should accept multiple allowed types', () => {
    const { result } = renderHook(() =>
      useImageUpload(5, ['image/jpeg', 'image/png', 'image/webp'])
    );

    const mockReadAsDataURL = vi.fn(function (this: FileReader) {
      if (this.onloadend) {
        Object.defineProperty(this, 'result', {
          value: 'data:image/webp;base64,abc123',
          writable: false,
        });
        this.onloadend({} as ProgressEvent<FileReader>);
      }
    });

    global.FileReader = vi.fn(function (this: FileReader) {
      this.readAsDataURL = mockReadAsDataURL;
      return this;
    }) as unknown as typeof FileReader;

    const mockFile = new File(['content'], 'test.webp', { type: 'image/webp' });
    const mockEvent = {
      target: {
        files: [mockFile],
      },
    } as unknown as React.ChangeEvent<HTMLInputElement>;

    act(() => {
      result.current.handleFileChange(mockEvent);
    });

    expect(result.current.error).toBe('');
    expect(result.current.file).toBe(mockFile);
  });

  it('should handle different max size values', () => {
    const { result } = renderHook(() =>
      useImageUpload(10, ['image/jpeg', 'image/png'])
    );

    const largeContent = new Array(11 * 1024 * 1024).fill('a').join('');
    const mockFile = new File([largeContent], 'test.jpg', {
      type: 'image/jpeg',
    });
    const mockEvent = {
      target: {
        files: [mockFile],
      },
    } as unknown as React.ChangeEvent<HTMLInputElement>;

    act(() => {
      result.current.handleFileChange(mockEvent);
    });

    expect(result.current.error).toBe('File size must be less than 10MB');
  });

  it('should clear error when valid file is selected after invalid one', async () => {
    const { result } = renderHook(() =>
      useImageUpload(5, ['image/jpeg', 'image/png'])
    );

    const invalidFile = new File(['content'], 'test.gif', { type: 'image/gif' });
    const invalidEvent = {
      target: {
        files: [invalidFile],
      },
    } as unknown as React.ChangeEvent<HTMLInputElement>;

    act(() => {
      result.current.handleFileChange(invalidEvent);
    });

    expect(result.current.error).toBe('Invalid file type');

    const mockReadAsDataURL = vi.fn(function (this: FileReader) {
      if (this.onloadend) {
        Object.defineProperty(this, 'result', {
          value: 'data:image/jpeg;base64,abc123',
          writable: false,
        });
        this.onloadend({} as ProgressEvent<FileReader>);
      }
    });

    global.FileReader = vi.fn(function (this: FileReader) {
      this.readAsDataURL = mockReadAsDataURL;
      return this;
    }) as unknown as typeof FileReader;

    const validFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
    const validEvent = {
      target: {
        files: [validFile],
      },
    } as unknown as React.ChangeEvent<HTMLInputElement>;

    await act(async () => {
      result.current.handleFileChange(validEvent);
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.error).toBe('');
    expect(result.current.file).toBe(validFile);
  });
});
