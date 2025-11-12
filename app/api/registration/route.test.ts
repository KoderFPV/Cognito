import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { Db } from 'mongodb';
import { POST } from './route';
import { setupMongoTest, teardownMongoTest, IMongoTestContext } from '@/test/utils/mongoTestUtils';

vi.mock('@/clients/mongodb/mongodb', () => ({
  connectToMongo: vi.fn(),
}));

vi.mock('@/services/locale/locale.service', () => ({
  getLocaleFromRequest: vi.fn(() => 'en'),
}));

vi.mock('@/services/validation/validation.service', () => ({
  initZodI18n: vi.fn(),
}));

vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn(async () => (key: string) => key),
}));

describe('POST /api/registration', () => {
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

  const createRequest = (body: any, locale: string): NextRequest => {
    return {
      json: async () => body,
      headers: new Headers({
        'content-type': 'application/json',
      }),
      url: `http://localhost:3000/${locale}/api/registration`,
    } as NextRequest;
  };

  it('should create user with valid data', async () => {
    const requestBody = {
      email: 'newuser@example.com',
      password: 'Password123',
      termsAccepted: true,
    };

    const request = createRequest(requestBody, 'en');
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.message).toBeDefined();
    expect(data.user).toBeDefined();
    expect(data.user.email).toBe('newuser@example.com');
    expect(data.user.id).toBeDefined();
  });

  it('should reject invalid email', async () => {
    const requestBody = {
      email: 'invalidemail',
      password: 'Password123',
      termsAccepted: true,
    };

    const request = createRequest(requestBody, 'pl');
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.message).toBeDefined();
  });

  it('should reject password without uppercase', async () => {
    const requestBody = {
      email: 'test@example.com',
      password: 'password123',
      termsAccepted: true,
    };

    const request = createRequest(requestBody, 'en');
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.message).toBeDefined();
  });

  it('should reject password without number', async () => {
    const requestBody = {
      email: 'test@example.com',
      password: 'PasswordABC',
      termsAccepted: true,
    };

    const request = createRequest(requestBody, 'pl');
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.message).toBeDefined();
  });

  it('should reject short password', async () => {
    const requestBody = {
      email: 'test@example.com',
      password: 'Pass1',
      termsAccepted: true,
    };

    const request = createRequest(requestBody, 'en');
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.message).toBeDefined();
  });

  it('should reject when terms not accepted', async () => {
    const requestBody = {
      email: 'test@example.com',
      password: 'Password123',
      termsAccepted: false,
    };

    const request = createRequest(requestBody, 'pl');
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.message).toBeDefined();
  });

  it('should reject duplicate email', async () => {
    const requestBody = {
      email: 'duplicate@example.com',
      password: 'Password123',
      termsAccepted: true,
    };

    const request1 = createRequest(requestBody, 'en');
    await POST(request1);

    const request2 = createRequest(requestBody, 'en');
    const response = await POST(request2);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.message).toBeDefined();
  });

  it('should not return password hash in response', async () => {
    const requestBody = {
      email: 'secure@example.com',
      password: 'Password123',
      termsAccepted: true,
    };

    const request = createRequest(requestBody, 'pl');
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.user.hash).toBeUndefined();
    expect(data.user.password).toBeUndefined();
  });

  it('should return only safe user fields', async () => {
    const requestBody = {
      email: 'safefields@example.com',
      password: 'Password123',
      termsAccepted: true,
    };

    const request = createRequest(requestBody, 'en');
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.user).toHaveProperty('id');
    expect(data.user).toHaveProperty('email');
    expect(data.user).toHaveProperty('role');
    expect(data.user).not.toHaveProperty('hash');
    expect(data.user).not.toHaveProperty('password');
    expect(data.user).not.toHaveProperty('deleted');
    expect(data.user).not.toHaveProperty('banned');
  });
});
