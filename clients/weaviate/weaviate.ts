import weaviate, { WeaviateClient } from 'weaviate-client';
import { getWeaviateUrl } from '@/services/config/config.service';

let cachedClient: WeaviateClient | null = null;

export const connectToWeaviate = async (): Promise<WeaviateClient> => {
  if (cachedClient) {
    return cachedClient;
  }

  const url = getWeaviateUrl();

  const client = await weaviate.connectToCustom({
    httpHost: url,
  });

  cachedClient = client;

  return client;
};

export const closeWeaviateConnection = async (): Promise<void> => {
  if (cachedClient) {
    await cachedClient.close();
    cachedClient = null;
  }
};
