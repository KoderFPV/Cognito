import { useState, useCallback } from 'react';

export interface IFormField<T> {
  value: T;
  error: string;
  touched: boolean;
  setValue: (value: T) => void;
  setError: (error: string) => void;
  setTouched: (touched: boolean) => void;
  reset: () => void;
}

export const useFormField = <T>(initialValue: T): IFormField<T> => {
  const [value, setValue] = useState<T>(initialValue);
  const [error, setError] = useState<string>('');
  const [touched, setTouched] = useState<boolean>(false);

  const reset = useCallback(() => {
    setValue(initialValue);
    setError('');
    setTouched(false);
  }, [initialValue]);

  return {
    value,
    error,
    touched,
    setValue,
    setError,
    setTouched,
    reset,
  };
};
