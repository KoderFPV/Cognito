import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WeaviateClient } from 'weaviate-client';

const mockWeaviateClient = {
  close: vi.fn().mockResolvedValue(undefined),
};

class MockApiKey {
  _apiKey: string;

  constructor(key: string) {
    this._apiKey = key;
  }
}

vi.mock('weaviate-client', () => ({
  default: {
    connectToCustom: vi.fn().mockResolvedValue(mockWeaviateClient),
    ApiKey: MockApiKey,
  },
}));

vi.mock('@/services/config/config.service', () => ({
  getWeaviateHttpHost: vi.fn(() => 'localhost'),
  getWeaviateHttpPort: vi.fn(() => 8083),
  getWeaviateGrpcHost: vi.fn(() => 'localhost'),
  getWeaviateGrpcPort: vi.fn(() => 50053),
  isWeaviateSecure: vi.fn(() => false),
  getWeaviateApiKey: vi.fn(() => 'test-api-key'),
}));

describe('weaviate client', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await vi.resetModules();
  });

  it('should connect to Weaviate on first call with proper gRPC configuration', async () => {
    const weaviate = await import('weaviate-client');
    const { connectToWeaviate } = await import('./weaviate');

    const client = await connectToWeaviate();

    expect(client).toBeDefined();
    expect(weaviate.default.connectToCustom).toHaveBeenCalledTimes(1);
    expect(weaviate.default.connectToCustom).toHaveBeenCalledWith({
      httpHost: 'localhost',
      httpPort: 8083,
      httpSecure: false,
      grpcHost: 'localhost',
      grpcPort: 50053,
      grpcSecure: false,
      authCredentials: expect.objectContaining({
        _apiKey: 'test-api-key',
      }),
    });
  });

  it('should return cached connection on subsequent calls', async () => {
    const weaviate = await import('weaviate-client');
    const { connectToWeaviate } = await import('./weaviate');

    const client1 = await connectToWeaviate();
    const client2 = await connectToWeaviate();

    expect(client1).toBe(client2);
    expect(weaviate.default.connectToCustom).toHaveBeenCalledTimes(1);
  });

  it('should close connection', async () => {
    const { connectToWeaviate, closeWeaviateConnection } = await import(
      './weaviate'
    );

    await connectToWeaviate();
    await closeWeaviateConnection();

    expect(mockWeaviateClient.close).toHaveBeenCalledTimes(1);
  });

  it('should clear cache when connection is closed', async () => {
    const { connectToWeaviate, closeWeaviateConnection } = await import(
      './weaviate'
    );
    const weaviate = await import('weaviate-client');

    await connectToWeaviate();
    await closeWeaviateConnection();
    await connectToWeaviate();

    expect(weaviate.default.connectToCustom).toHaveBeenCalledTimes(2);
  });
});
