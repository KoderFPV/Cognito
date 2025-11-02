import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Db } from 'mongodb';
import { ROLE } from '@/domain/user';
import {
  registrationSchema,
  createUserAccount,
} from './registration.service';
import { validateEmail, validatePassword } from './registration.validation';
import { setupMongoTest, teardownMongoTest, IMongoTestContext } from '@/test/utils/mongoTestUtils';

vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn(async () => (key: string) => key),
}));

describe('registration.service', () => {
  let context: IMongoTestContext;
  let db: Db;

  beforeEach(async () => {
    context = await setupMongoTest();
    db = context.db;
  });

  afterEach(async () => {
    await teardownMongoTest(context);
  });

  describe('validateEmail', () => {
    it('should validate correct email', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@domain.co.uk')).toBe(true);
    });

    it('should reject invalid email', () => {
      expect(validateEmail('notanemail')).toBe(false);
      expect(validateEmail('missing@domain')).toBe(false);
      expect(validateEmail('@domain.com')).toBe(false);
      expect(validateEmail('user@')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('should validate password with all requirements', () => {
      const result = validatePassword('Password1');
      expect(result.minLength).toBe(true);
      expect(result.hasUppercase).toBe(true);
      expect(result.hasNumber).toBe(true);
    });

    it('should reject password without minimum length', () => {
      const result = validatePassword('Pass1');
      expect(result.minLength).toBe(false);
    });

    it('should reject password without uppercase', () => {
      const result = validatePassword('password1');
      expect(result.hasUppercase).toBe(false);
    });

    it('should reject password without number', () => {
      const result = validatePassword('Password');
      expect(result.hasNumber).toBe(false);
    });
  });

  describe('registrationSchema', () => {
    it('should validate correct data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'Password123',
        termsAccepted: true,
      };

      const result = registrationSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'notanemail',
        password: 'Password123',
        termsAccepted: true,
      };

      const result = registrationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject password without uppercase', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'password123',
        termsAccepted: true,
      };

      const result = registrationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject password without number', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'PasswordABC',
        termsAccepted: true,
      };

      const result = registrationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject short password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'Pass1',
        termsAccepted: true,
      };

      const result = registrationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject when terms not accepted', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'Password123',
        termsAccepted: false,
      };

      const result = registrationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('createUserAccount', () => {
    it('should create user account with validated data', async () => {
      const validData = {
        email: 'account@example.com',
        password: 'Password123',
        termsAccepted: true,
      };

      const user = await createUserAccount(db, validData, 'en');

      expect(user).toBeDefined();
      expect(user.email).toBe('account@example.com');
      expect(user.role).toBe(ROLE.CUSTOMER);
      expect(user.activated).toBe(false);
      expect(user.deleted).toBe(false);
      expect(user.hash).toBeDefined();
      expect(user.hash).not.toBe('Password123');
    });

    it('should throw error for duplicate email', async () => {
      const validData = {
        email: 'duplicate@example.com',
        password: 'Password123',
        termsAccepted: true,
      };

      await createUserAccount(db, validData, 'en');

      await expect(createUserAccount(db, validData, 'en')).rejects.toThrow();
    });

    it('should hash password', async () => {
      const validData = {
        email: 'hash-test@example.com',
        password: 'Password123',
        termsAccepted: true,
      };

      const user = await createUserAccount(db, validData, 'en');

      expect(user.hash).not.toBe('Password123');
      expect(user.hash.length).toBeGreaterThan(20);
    });
  });
});
