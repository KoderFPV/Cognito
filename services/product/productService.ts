import { connectToWeaviate } from '@/clients/weaviate/weaviate';
import { connectToMongo } from '@/clients/mongodb/mongodb';
import { createProduct, deleteProduct, getProductById } from '@/models/products/productsModel';
import {
  addProductToWeaviate,
  deleteProductFromWeaviate,
} from '@/models/products/weaviateProductsModel';
import {
  validateProductData,
  ProductInput,
} from '@/services/product/productValidation.service';
import { IProduct } from '@/domain/product';

export const createProduct = async (
  productData: unknown,
  locale: string
): Promise<IProduct> => {
  const validatedData = await validateProductData(productData, locale);

  const weaviateClient = await connectToWeaviate();
  let createdProduct: IProduct;

  try {
    createdProduct = await createProduct(validatedData);

    try {
      await addProductToWeaviate(weaviateClient, createdProduct);
    } catch (weaviateError) {
      const db = await connectToMongo();
      await deleteProduct(db, createdProduct._id);

      throw new Error(
        `Failed to sync product to Weaviate: ${
          weaviateError instanceof Error ? weaviateError.message : 'Unknown error'
        }`
      );
    }

    return createdProduct;
  } catch (error) {
    throw error;
  }
};

export const deleteProduct = async (
  productId: string,
  locale: string
): Promise<boolean> => {
  const db = await connectToMongo();
  const product = await getProductById(db, productId);

  if (!product) {
    return false;
  }

  const wasDeleted = await deleteProduct(db, productId);

  if (!wasDeleted) {
    return false;
  }

  const weaviateClient = await connectToWeaviate();

  try {
    await deleteProductFromWeaviate(weaviateClient, productId);
  } catch (weaviateError) {
    const restoreDb = await connectToMongo();
    const { ObjectId } = await import('mongodb');

    await restoreDb.collection('products').updateOne(
      { _id: new ObjectId(productId) },
      { $set: { deleted: false } }
    );

    throw new Error(
      `Failed to sync product deletion to Weaviate: ${
        weaviateError instanceof Error ? weaviateError.message : 'Unknown error'
      }`
    );
  }

  return true;
};
