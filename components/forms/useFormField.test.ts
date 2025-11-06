import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFormField } from './useFormField';

describe('useFormField', () => {
  it('should initialize with provided initial value', () => {
    const { result } = renderHook(() => useFormField('initial value'));

    expect(result.current.value).toBe('initial value');
    expect(result.current.error).toBe('');
    expect(result.current.touched).toBe(false);
  });

  it('should initialize with number value', () => {
    const { result } = renderHook(() => useFormField(42));

    expect(result.current.value).toBe(42);
  });

  it('should initialize with boolean value', () => {
    const { result } = renderHook(() => useFormField(true));

    expect(result.current.value).toBe(true);
  });

  it('should update value', () => {
    const { result } = renderHook(() => useFormField('initial'));

    act(() => {
      result.current.setValue('updated');
    });

    expect(result.current.value).toBe('updated');
  });

  it('should update error', () => {
    const { result } = renderHook(() => useFormField(''));

    act(() => {
      result.current.setError('This field is required');
    });

    expect(result.current.error).toBe('This field is required');
  });

  it('should update touched state', () => {
    const { result } = renderHook(() => useFormField(''));

    expect(result.current.touched).toBe(false);

    act(() => {
      result.current.setTouched(true);
    });

    expect(result.current.touched).toBe(true);
  });

  it('should reset to initial value', () => {
    const { result } = renderHook(() => useFormField('initial'));

    act(() => {
      result.current.setValue('changed');
      result.current.setError('error message');
      result.current.setTouched(true);
    });

    expect(result.current.value).toBe('changed');
    expect(result.current.error).toBe('error message');
    expect(result.current.touched).toBe(true);

    act(() => {
      result.current.reset();
    });

    expect(result.current.value).toBe('initial');
    expect(result.current.error).toBe('');
    expect(result.current.touched).toBe(false);
  });

  it('should handle complex object as value', () => {
    const initialValue = { name: 'test', age: 25 };
    const { result } = renderHook(() => useFormField(initialValue));

    expect(result.current.value).toEqual(initialValue);

    const updatedValue = { name: 'updated', age: 30 };
    act(() => {
      result.current.setValue(updatedValue);
    });

    expect(result.current.value).toEqual(updatedValue);
  });

  it('should handle array as value', () => {
    const initialValue = [1, 2, 3];
    const { result } = renderHook(() => useFormField(initialValue));

    expect(result.current.value).toEqual(initialValue);

    const updatedValue = [4, 5, 6];
    act(() => {
      result.current.setValue(updatedValue);
    });

    expect(result.current.value).toEqual(updatedValue);
  });

  it('should reset to new initial value when initialValue changes', () => {
    const { result, rerender } = renderHook(
      ({ initial }) => useFormField(initial),
      { initialProps: { initial: 'first' } }
    );

    expect(result.current.value).toBe('first');

    act(() => {
      result.current.setValue('changed');
    });

    expect(result.current.value).toBe('changed');

    rerender({ initial: 'second' });

    act(() => {
      result.current.reset();
    });

    expect(result.current.value).toBe('second');
  });

  it('should clear error when value changes', () => {
    const { result } = renderHook(() => useFormField(''));

    act(() => {
      result.current.setError('Error message');
      result.current.setTouched(true);
    });

    expect(result.current.error).toBe('Error message');
    expect(result.current.touched).toBe(true);

    act(() => {
      result.current.setValue('new value');
    });

    expect(result.current.value).toBe('new value');
    expect(result.current.error).toBe('Error message');
    expect(result.current.touched).toBe(true);
  });

  it('should handle null as initial value', () => {
    const { result } = renderHook(() => useFormField<string | null>(null));

    expect(result.current.value).toBe(null);

    act(() => {
      result.current.setValue('value');
    });

    expect(result.current.value).toBe('value');

    act(() => {
      result.current.reset();
    });

    expect(result.current.value).toBe(null);
  });

  it('should handle undefined as initial value', () => {
    const { result } = renderHook(() => useFormField<string | undefined>(undefined));

    expect(result.current.value).toBe(undefined);

    act(() => {
      result.current.setValue('value');
    });

    expect(result.current.value).toBe('value');

    act(() => {
      result.current.reset();
    });

    expect(result.current.value).toBe(undefined);
  });
});
