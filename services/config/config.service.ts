export const getMongoDbUri = (): string => {
  const uri = process.env.MONGODB_URI;

  if (!uri || !uri.trim()) {
    throw new Error('MONGODB_URI environment variable is required');
  }

  if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
    throw new Error('MONGODB_URI must start with mongodb:// or mongodb+srv://');
  }

  return uri;
};

export const getWeaviateUrl = (): string => {
  const url = process.env.WEAVIATE_URL;

  if (!url || !url.trim()) {
    throw new Error('WEAVIATE_URL environment variable is required');
  }

  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    throw new Error('WEAVIATE_URL must start with http:// or https://');
  }

  return url;
};

export const getWeaviateApiKey = (): string => {
  const apiKey = process.env.WEAVIATE_API_KEY;

  if (!apiKey || !apiKey.trim()) {
    throw new Error('WEAVIATE_API_KEY environment variable is required');
  }

  return apiKey;
};

export const getWeaviateHttpHost = (): string => {
  const host = process.env.WEAVIATE_HTTP_HOST;

  if (!host || !host.trim()) {
    throw new Error('WEAVIATE_HTTP_HOST environment variable is required');
  }

  return host;
};

export const getWeaviateHttpPort = (): number => {
  const port = process.env.WEAVIATE_HTTP_PORT;

  if (!port || !port.trim()) {
    throw new Error('WEAVIATE_HTTP_PORT environment variable is required');
  }

  const parsedPort = Number(port);

  if (isNaN(parsedPort) || parsedPort < 1 || parsedPort > 65535) {
    throw new Error('WEAVIATE_HTTP_PORT must be a valid port number (1-65535)');
  }

  return parsedPort;
};

export const getWeaviateGrpcHost = (): string => {
  const host = process.env.WEAVIATE_GRPC_HOST;

  if (!host || !host.trim()) {
    throw new Error('WEAVIATE_GRPC_HOST environment variable is required');
  }

  return host;
};

export const getWeaviateGrpcPort = (): number => {
  const port = process.env.WEAVIATE_GRPC_PORT;

  if (!port || !port.trim()) {
    throw new Error('WEAVIATE_GRPC_PORT environment variable is required');
  }

  const parsedPort = Number(port);

  if (isNaN(parsedPort) || parsedPort < 1 || parsedPort > 65535) {
    throw new Error('WEAVIATE_GRPC_PORT must be a valid port number (1-65535)');
  }

  return parsedPort;
};

export const isWeaviateSecure = (): boolean => {
  const secure = process.env.WEAVIATE_SECURE;

  return secure === 'true';
};
