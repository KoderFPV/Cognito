import { WeaviateClient, CollectionConfigCreate, vectors, configure, dataType } from 'weaviate-client';
import {
  getSnowflakeInferenceUrl,
  getOpenClipInferenceUrl,
} from '@/services/config/config.service';

const PRODUCTS_COLLECTION = 'Product';

export const createWeaviateProductsCollection = async (
  client: WeaviateClient
) => {
  const collectionExists = await client.collections.exists(PRODUCTS_COLLECTION);

  if (collectionExists) {
    return;
  }

  const config = {
    name: PRODUCTS_COLLECTION,
    properties: [
      { name: 'id', dataType: dataType.TEXT },
      { name: 'name', dataType: dataType.TEXT },
      { name: 'description', dataType: dataType.TEXT },
      { name: 'category', dataType: dataType.TEXT },
      { name: 'price', dataType: dataType.NUMBER },
      { name: 'sku', dataType: dataType.TEXT },
      { name: 'stock', dataType: dataType.NUMBER },
      { name: 'imageUrl', dataType: dataType.TEXT },
    ],
    vectorizers: [
      vectors.text2VecTransformers({
        name: 'text_vector',
        sourceProperties: ['name', 'description', 'category'],
        vectorIndexConfig: configure.vectorIndex.hnsw(),
        inferenceUrl: getSnowflakeInferenceUrl(),
      }),
      vectors.multi2VecClip({
        name: 'image_vector',
        imageFields: ['imageUrl'],
        vectorIndexConfig: configure.vectorIndex.hnsw(),
        inferenceUrl: getOpenClipInferenceUrl(),
      }),
    ],
  };

  await client.collections.create(config);
};
