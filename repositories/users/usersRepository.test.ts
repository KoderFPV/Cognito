import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Db } from 'mongodb';
import { ROLE } from '@/domain/user';
import { findUserByEmail, findUserById, createUser } from './usersRepository';
import { setupMongoTest, teardownMongoTest, IMongoTestContext } from '@/test/utils/mongoTestUtils';

vi.mock('@/clients/mongodb/mongodb', () => ({
  connectToMongo: vi.fn(),
}));

describe('usersRepository', () => {
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

  describe('createUser', () => {
    it('should create a new user', async () => {
      const userData = {
        email: 'test@example.com',
        hash: 'hashedpassword',
        firstName: 'John',
        lastName: 'Doe',
        phone: '123456789',
        address: 'Test Street',
        city: 'Warsaw',
        postal: '00-000',
        country: 'Poland',
        role: ROLE.CUSTOMER,
        activated: false,
        deleted: false,
        banned: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const user = await createUser(userData);

      expect(user).toBeDefined();
      expect(user._id).toBeDefined();
      expect(user.email).toBe('test@example.com');
      expect(user.role).toBe(ROLE.CUSTOMER);
    });
  });

  describe('findUserByEmail', () => {
    it('should find user by email', async () => {
      const userData = {
        email: 'find@example.com',
        hash: 'hash',
        firstName: 'Jane',
        lastName: 'Doe',
        phone: '987654321',
        address: 'Test Ave',
        city: 'Krakow',
        postal: '11-111',
        country: 'Poland',
        role: ROLE.CUSTOMER,
        activated: true,
        deleted: false,
        banned: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await createUser(userData);
      const found = await findUserByEmail('find@example.com');

      expect(found).toBeDefined();
      expect(found?.email).toBe('find@example.com');
    });

    it('should return null for non-existent email', async () => {
      const found = await findUserByEmail('nonexistent@example.com');
      expect(found).toBeNull();
    });

    it('should not find deleted users', async () => {
      const userData = {
        email: 'deleted@example.com',
        hash: 'hash',
        firstName: 'Deleted',
        lastName: 'User',
        phone: '111111111',
        address: 'Test',
        city: 'Test',
        postal: '00-000',
        country: 'Test',
        role: ROLE.CUSTOMER,
        activated: false,
        deleted: true,
        banned: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await createUser(userData);
      const found = await findUserByEmail('deleted@example.com');

      expect(found).toBeNull();
    });
  });

  describe('findUserById', () => {
    it('should find user by id', async () => {
      const userData = {
        email: 'byid@example.com',
        hash: 'hash',
        firstName: 'Test',
        lastName: 'User',
        phone: '222222222',
        address: 'Test',
        city: 'Test',
        postal: '00-000',
        country: 'Test',
        role: ROLE.ADMIN,
        activated: true,
        deleted: false,
        banned: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const created = await createUser(userData);
      const found = await findUserById(created._id);

      expect(found).toBeDefined();
      expect(found?._id).toBe(created._id);
      expect(found?.role).toBe(ROLE.ADMIN);
    });

    it('should return null for non-existent id', async () => {
      const found = await findUserById('nonexistent-id');
      expect(found).toBeNull();
    });
  });
});
