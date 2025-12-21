import { WeaviateClient } from 'weaviate-client';
import { IProduct } from '@/domain/product';

const PRODUCTS_COLLECTION = 'Product';

interface IWeaviateProduct {
  mongoId: string;
  name: string;
  description: string;
  category: string;
  price: number;
  sku: string;
  stock: number;
  imageUrl?: string;
}

const mapProductToWeaviate = (product: IProduct): IWeaviateProduct => ({
  mongoId: product._id,
  name: product.name,
  description: product.description,
  category: product.category,
  price: product.price,
  sku: product.sku,
  stock: product.stock,
  imageUrl: product.imageUrl,
});

export const addProductToWeaviate = async (
  client: WeaviateClient,
  product: IProduct
): Promise<void> => {
  const weaviateProduct = mapProductToWeaviate(product);
  const collection = client.collections.get(PRODUCTS_COLLECTION);

  await collection.data.insert(weaviateProduct as any);
};

export const deleteProductFromWeaviate = async (
  client: WeaviateClient,
  productId: string
): Promise<void> => {
  const collection = client.collections.get(PRODUCTS_COLLECTION);

  const whereFilter = collection.filter.byProperty('mongoId').equal(productId);
  await collection.data.deleteMany(whereFilter);
};
