import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useRegistrationForm } from './useRegistrationForm';

const mockPush = vi.fn();
const mockRouter = {
  push: mockPush,
  replace: vi.fn(),
  refresh: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  prefetch: vi.fn(),
};

const testLocale = process.env.TEST_LOCALE || 'en';

const mockParams = {
  locale: testLocale,
};

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  useParams: () => mockParams,
}));

vi.mock('@/repositories/api/registration/registrationApiRepository', () => ({
  registerUser: vi.fn(),
}));

describe('useRegistrationForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with empty values', () => {
    const { result } = renderHook(() => useRegistrationForm());

    expect(result.current.email).toBe('');
    expect(result.current.password).toBe('');
    expect(result.current.confirmPassword).toBe('');
    expect(result.current.termsAccepted).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.validationErrors).toEqual({});
  });

  it('should update email', () => {
    const { result } = renderHook(() => useRegistrationForm());

    act(() => {
      result.current.handleEmailChange('test@example.com');
    });

    expect(result.current.email).toBe('test@example.com');
  });

  it('should update password', () => {
    const { result } = renderHook(() => useRegistrationForm());

    act(() => {
      result.current.handlePasswordChange('Password123');
    });

    expect(result.current.password).toBe('Password123');
  });

  it('should update confirm password', () => {
    const { result } = renderHook(() => useRegistrationForm());

    act(() => {
      result.current.handleConfirmPasswordChange('Password123');
    });

    expect(result.current.confirmPassword).toBe('Password123');
  });

  it('should update terms accepted', () => {
    const { result } = renderHook(() => useRegistrationForm());

    act(() => {
      result.current.handleTermsChange(true);
    });

    expect(result.current.termsAccepted).toBe(true);
  });

  it('should validate invalid email on submit', async () => {
    const { result } = renderHook(() => useRegistrationForm());

    act(() => {
      result.current.handleEmailChange('invalidemail');
      result.current.handlePasswordChange('Password123');
      result.current.handleConfirmPasswordChange('Password123');
    });

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() } as any);
    });

    expect(result.current.validationErrors.email).toBeDefined();
  });

  it('should validate password without uppercase', async () => {
    const { result } = renderHook(() => useRegistrationForm());

    act(() => {
      result.current.handleEmailChange('test@example.com');
      result.current.handlePasswordChange('password123');
      result.current.handleConfirmPasswordChange('password123');
    });

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() } as any);
    });

    expect(result.current.validationErrors.password).toBeDefined();
  });

  it('should validate password without number', async () => {
    const { result } = renderHook(() => useRegistrationForm());

    act(() => {
      result.current.handleEmailChange('test@example.com');
      result.current.handlePasswordChange('PasswordABC');
      result.current.handleConfirmPasswordChange('PasswordABC');
    });

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() } as any);
    });

    expect(result.current.validationErrors.password).toBeDefined();
  });

  it('should validate short password', async () => {
    const { result } = renderHook(() => useRegistrationForm());

    act(() => {
      result.current.handleEmailChange('test@example.com');
      result.current.handlePasswordChange('Pass1');
      result.current.handleConfirmPasswordChange('Pass1');
    });

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() } as any);
    });

    expect(result.current.validationErrors.password).toBeDefined();
  });

  it('should validate password mismatch', async () => {
    const { result } = renderHook(() => useRegistrationForm());

    act(() => {
      result.current.handleEmailChange('test@example.com');
      result.current.handlePasswordChange('Password123');
      result.current.handleConfirmPasswordChange('DifferentPassword123');
    });

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() } as any);
    });

    expect(result.current.validationErrors.confirmPassword).toBeDefined();
  });

  it('should clear validation error when field is updated', () => {
    const { result } = renderHook(() => useRegistrationForm());

    act(() => {
      result.current.handleEmailChange('invalid');
    });

    act(() => {
      result.current.handleSubmit({ preventDefault: vi.fn() } as any);
    });

    expect(result.current.validationErrors.email).toBeDefined();

    act(() => {
      result.current.handleEmailChange('valid@example.com');
    });

    expect(result.current.validationErrors.email).toBeUndefined();
  });

  it('should submit valid data', async () => {
    const { registerUser } = await import('@/repositories/api/registration/registrationApiRepository');
    vi.mocked(registerUser).mockResolvedValue({
      message: 'success',
      user: {} as any,
    });

    const { result } = renderHook(() => useRegistrationForm());

    act(() => {
      result.current.handleEmailChange('test@example.com');
      result.current.handlePasswordChange('Password123');
      result.current.handleConfirmPasswordChange('Password123');
      result.current.handleTermsChange(true);
    });

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() } as any);
    });

    await waitFor(() => {
      expect(registerUser).toHaveBeenCalledWith(
        {
          email: 'test@example.com',
          password: 'Password123',
          termsAccepted: true,
        },
        testLocale
      );
    });
  });

  it('should handle API error', async () => {
    const { registerUser } = await import('@/repositories/api/registration/registrationApiRepository');
    vi.mocked(registerUser).mockRejectedValue(new Error('errors.userExists'));

    const { result } = renderHook(() => useRegistrationForm());

    act(() => {
      result.current.handleEmailChange('test@example.com');
      result.current.handlePasswordChange('Password123');
      result.current.handleConfirmPasswordChange('Password123');
      result.current.handleTermsChange(true);
    });

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() } as any);
    });

    await waitFor(() => {
      expect(result.current.error).toBe('errors.userExists');
    });
  });

  it('should set loading state during submission', async () => {
    const { registerUser } = await import('@/repositories/api/registration/registrationApiRepository');
    vi.mocked(registerUser).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                message: 'success',
                user: {} as any,
              }),
            100
          )
        )
    );

    const { result } = renderHook(() => useRegistrationForm());

    act(() => {
      result.current.handleEmailChange('test@example.com');
      result.current.handlePasswordChange('Password123');
      result.current.handleConfirmPasswordChange('Password123');
      result.current.handleTermsChange(true);
    });

    act(() => {
      result.current.handleSubmit({ preventDefault: vi.fn() } as any);
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });
});
