import weaviate, { WeaviateClient } from 'weaviate-client';
import {
  getWeaviateHttpHost,
  getWeaviateHttpPort,
  getWeaviateGrpcHost,
  getWeaviateGrpcPort,
  isWeaviateSecure,
  getWeaviateApiKey,
} from '@/services/config/config.service';

let cachedClient: WeaviateClient | null = null;

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

  return client;
};

export const closeWeaviateConnection = async (): Promise<void> => {
  if (cachedClient) {
    await cachedClient.close();
    cachedClient = null;
  }
};
