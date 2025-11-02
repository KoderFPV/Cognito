import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Db } from 'mongodb';
import { ROLE } from '@/domain/user';
import {
  hashPassword,
  verifyPassword,
  registerUser,
  validateUserCredentials,
} from './auth.service';
import { setupMongoTest, teardownMongoTest, IMongoTestContext } from '@/test/utils/mongoTestUtils';
import { createUser } from '@/repositories/users/usersRepository';

vi.mock('@/clients/mongodb/mongodb', () => ({
  connectToMongo: vi.fn(),
}));

describe('auth.service', () => {
  let context: IMongoTestContext;
  let db: Db;

  beforeEach(async () => {
    context = await setupMongoTest();
    db = context.db;

    const { connectToMongo } = await import('@/clients/mongodb/mongodb');
    vi.mocked(connectToMongo).mockResolvedValue(db);
  });

  afterEach(async () => {
    await teardownMongoTest(context);
    vi.clearAllMocks();
  });

  describe('hashPassword', () => {
    it('should hash password', async () => {
      const password = 'testpassword123';
      const hashed = await hashPassword(password);

      expect(hashed).toBeDefined();
      expect(hashed).not.toBe(password);
      expect(hashed.length).toBeGreaterThan(0);
    });

    it('should generate different hashes for same password', async () => {
      const password = 'samepassword';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('verifyPassword', () => {
    it('should verify correct password', async () => {
      const password = 'correctpassword';
      const hash = await hashPassword(password);
      const isValid = await verifyPassword(password, hash);

      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'correctpassword';
      const hash = await hashPassword(password);
      const isValid = await verifyPassword('wrongpassword', hash);

      expect(isValid).toBe(false);
    });
  });

  describe('registerUser', () => {
    it('should register new user with CUSTOMER role', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'User',
        phone: '123456789',
        address: 'Test Address',
        city: 'Warsaw',
        postal: '00-000',
        country: 'Poland',
      };

      const user = await registerUser(userData);

      expect(user).toBeDefined();
      expect(user._id).toBeDefined();
      expect(user.email).toBe('newuser@example.com');
      expect(user.role).toBe(ROLE.CUSTOMER);
      expect(user.activated).toBe(false);
      expect(user.deleted).toBe(false);
      expect(user.banned).toBe(false);
      expect(user.hash).not.toBe('password123');
    });

    it('should throw error if email already exists', async () => {
      const userData = {
        email: 'duplicate@example.com',
        password: 'password123',
        firstName: 'First',
        lastName: 'User',
        phone: '123456789',
        address: 'Test',
        city: 'Warsaw',
        postal: '00-000',
        country: 'Poland',
      };

      await registerUser(userData);

      await expect(registerUser(userData)).rejects.toThrow(
        'User with this email already exists'
      );
    });
  });

  describe('validateUserCredentials', () => {
    it('should validate correct credentials', async () => {
      const userData = {
        email: 'valid@example.com',
        password: 'validpassword',
        firstName: 'Valid',
        lastName: 'User',
        phone: '123456789',
        address: 'Test',
        city: 'Warsaw',
        postal: '00-000',
        country: 'Poland',
      };

      await registerUser(userData);

      const result = await validateUserCredentials({
        email: 'valid@example.com',
        password: 'validpassword',
      });

      expect(result).toBeDefined();
      expect(result?.email).toBe('valid@example.com');
    });

    it('should return null for wrong password', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'correctpassword',
        firstName: 'Test',
        lastName: 'User',
        phone: '123456789',
        address: 'Test',
        city: 'Warsaw',
        postal: '00-000',
        country: 'Poland',
      };

      await registerUser(userData);

      const result = await validateUserCredentials({
        email: 'test@example.com',
        password: 'wrongpassword',
      });

      expect(result).toBeNull();
    });

    it('should return null for non-existent user', async () => {
      const result = await validateUserCredentials({
        email: 'nonexistent@example.com',
        password: 'anypassword',
      });

      expect(result).toBeNull();
    });

    it('should throw error for banned user', async () => {
      const hash = await hashPassword('password');

      await createUser({
        email: 'banned@example.com',
        hash,
        firstName: 'Banned',
        lastName: 'User',
        phone: '123456789',
        address: 'Test',
        city: 'Warsaw',
        postal: '00-000',
        country: 'Poland',
        role: ROLE.CUSTOMER,
        activated: true,
        deleted: false,
        banned: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(
        validateUserCredentials({
          email: 'banned@example.com',
          password: 'password',
        })
      ).rejects.toThrow('User account is banned');
    });
  });
});
