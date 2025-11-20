import { WeaviateClient } from 'weaviate-client';
import {
  getSnowflakeInferenceUrl,
  getOpenClipInferenceUrl,
} from '@/services/config/config.service';

const PRODUCTS_COLLECTION = 'Product';

const buildTextVectorizerConfig = () => {
  const config: Record<string, any> = {
    vectorizeCollectionName: false,
  };

  const snowflakeUrl = getSnowflakeInferenceUrl();
  if (snowflakeUrl) {
    config.inferenceUrl = snowflakeUrl;
  }

  return config;
};

const buildImageVectorizerConfig = () => {
  const config: Record<string, any> = {
    imageFields: ['imageUrl'],
    textFields: [],
  };

  const clipUrl = getOpenClipInferenceUrl();
  if (clipUrl) {
    config.inferenceUrl = clipUrl;
  }

  return config;
};

export const createWeaviateProductsCollection = async (
  client: WeaviateClient
): Promise<void> => {
  const collectionExists = await client.collections.exists(PRODUCTS_COLLECTION);

  if (collectionExists) {
    return;
  }

  const textConfig = buildTextVectorizerConfig();
  const imageConfig = buildImageVectorizerConfig();

  const config: Record<string, any> = {
    name: PRODUCTS_COLLECTION,
    properties: [
      { name: 'id', dataType: 'text' },
      { name: 'name', dataType: 'text' },
      { name: 'description', dataType: 'text' },
      { name: 'category', dataType: 'text' },
      { name: 'price', dataType: 'number' },
      { name: 'sku', dataType: 'text' },
      { name: 'stock', dataType: 'int' },
      { name: 'imageUrl', dataType: 'text' },
    ],
    vectorizers: [
      {
        name: 'text_vector',
        vectorizer: { name: 'text2vec-transformers', config: textConfig },
      },
      {
        name: 'image_vector',
        vectorizer: { name: 'multi2vec-clip', config: imageConfig },
      },
    ],
  };

  await (client.collections as any).create(config);
};
