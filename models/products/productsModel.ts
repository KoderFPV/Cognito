import { ObjectId } from 'mongodb';
import { IProduct, IProductCreateInput } from '@/domain/product';
import { connectToMongo } from '@/clients/mongodb/mongodb';

export const PRODUCTS_COLLECTION = 'products';

export const createProduct = async (
  productData: IProductCreateInput
): Promise<IProduct> => {
  const db = await connectToMongo();
  const collection = db.collection<IProduct>(PRODUCTS_COLLECTION);

  const now = new Date();
  const product = {
    ...productData,
    createdAt: now,
    updatedAt: now,
    deleted: false,
  };

  const result = await collection.insertOne(product as any);

  return {
    ...product,
    _id: result.insertedId.toString(),
  };
};
