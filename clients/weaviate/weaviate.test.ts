import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WeaviateClient } from 'weaviate-client';

const mockWeaviateClient = {
  close: vi.fn().mockResolvedValue(undefined),
};

vi.mock('weaviate-client', () => ({
  default: {
    connectToCustom: vi.fn().mockResolvedValue(mockWeaviateClient),
  },
}));

vi.mock('@/services/config/config.service', () => ({
  getWeaviateUrl: vi.fn(() => 'http://localhost:8080'),
}));

describe('weaviate client', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await vi.resetModules();
  });

  it('should connect to Weaviate on first call', async () => {
    const weaviate = await import('weaviate-client');
    const { connectToWeaviate } = await import('./weaviate');

    const client = await connectToWeaviate();

    expect(client).toBeDefined();
    expect(weaviate.default.connectToCustom).toHaveBeenCalledTimes(1);
    expect(weaviate.default.connectToCustom).toHaveBeenCalledWith({
      httpHost: 'http://localhost:8080',
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
