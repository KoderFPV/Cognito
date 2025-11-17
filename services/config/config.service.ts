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
