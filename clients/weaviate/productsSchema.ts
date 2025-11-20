import { WeaviateClient } from 'weaviate-client';
import {
  getSnowflakeInferenceUrl,
  getOpenClipInferenceUrl,
} from '@/services/config/config.service';

const PRODUCTS_COLLECTION = 'Product';

export const createWeaviateProductsCollection = async (
  client: WeaviateClient
): Promise<void> => {
  const collectionExists = await client.collections.exists(PRODUCTS_COLLECTION);

  if (collectionExists) {
    return;
  }

  await (client.collections as any).create({
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
        vectorizer: {
          name: 'text2vec-transformers',
          config: {
            sourceProperties: ['name', 'description', 'category'],
            vectorizeCollectionName: false,
            inferenceUrl: getSnowflakeInferenceUrl(),
          },
        },
      },
      {
        name: 'image_vector',
        vectorizer: {
          name: 'multi2vec-clip',
          config: {
            imageFields: ['imageUrl'],
            textFields: [],
            inferenceUrl: getOpenClipInferenceUrl(),
          },
        },
      },
    ],
  });
};
