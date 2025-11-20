import weaviate, { WeaviateClient } from 'weaviate-client';
import {
  getWeaviateHttpHost,
  getWeaviateHttpPort,
  getWeaviateGrpcHost,
  getWeaviateGrpcPort,
  isWeaviateSecure,
  getWeaviateApiKey,
} from '@/services/config/config.service';
import { createWeaviateProductsCollection } from '@/clients/weaviate/productsSchema';

let cachedClient: WeaviateClient | null = null;
let schemaInitialized = false;

export const connectToWeaviate = async (): Promise<WeaviateClient> => {
  if (cachedClient) {
    return cachedClient;
  }

  const httpHost = getWeaviateHttpHost();
  const httpPort = getWeaviateHttpPort();
  const grpcHost = getWeaviateGrpcHost();
  const grpcPort = getWeaviateGrpcPort();
  const secure = isWeaviateSecure();
  const apiKey = getWeaviateApiKey();

  const client = await weaviate.connectToCustom({
    httpHost,
    httpPort,
    httpSecure: secure,
    grpcHost,
    grpcPort,
    grpcSecure: secure,
    authCredentials: new weaviate.ApiKey(apiKey),
  });

  cachedClient = client;

  if (!schemaInitialized) {
    try {
      await createWeaviateProductsCollection(client);
    } catch (error) {
      console.error(
        'Failed to initialize Weaviate products schema:',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
    schemaInitialized = true;
  }

  return client;
};

export const closeWeaviateConnection = async (): Promise<void> => {
  if (cachedClient) {
    await cachedClient.close();
    cachedClient = null;
  }
};
