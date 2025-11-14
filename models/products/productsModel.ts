import { ObjectId, Db } from 'mongodb';
import { IProduct, IProductCreateInput } from '@/domain/product';
import { connectToMongo } from '@/clients/mongodb/mongodb';

export const PRODUCTS_COLLECTION = 'products';

interface IProductMongo extends Omit<IProduct, '_id'> {
  _id: ObjectId;
}

export const createProduct = async (
  productData: IProductCreateInput
): Promise<IProduct> => {
  const db = await connectToMongo();
  const collection = db.collection<IProductMongo>(PRODUCTS_COLLECTION);

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

export const getProductById = async (
  db: Db,
  productId: string
): Promise<IProduct | null> => {
  const collection = db.collection<IProductMongo>(PRODUCTS_COLLECTION);

  try {
    const objectId = new ObjectId(productId);
    const product = await collection.findOne({
      _id: objectId,
    });

    if (!product) {
      return null;
    }

    return {
      ...product,
      _id: product._id.toString(),
    };
  } catch {
    return null;
  }
};

export const findAllProducts = async (
  db: Db,
  limit: number,
  offset: number
): Promise<{ products: IProduct[]; total: number }> => {
  const collection = db.collection<IProductMongo>(PRODUCTS_COLLECTION);

  const total = await collection.countDocuments({ deleted: false });
  const products = await collection
    .find({ deleted: false })
    .sort({ updatedAt: -1 })
    .skip(offset)
    .limit(limit)
    .toArray();

  return {
    products: products.map((product) => ({
      ...product,
      _id: product._id.toString(),
    })),
    total,
  };
};

export const deleteProduct = async (
  db: Db,
  productId: string
): Promise<boolean> => {
  const collection = db.collection<IProductMongo>(PRODUCTS_COLLECTION);

  try {
    const objectId = new ObjectId(productId);
    const result = await collection.updateOne(
      { _id: objectId },
      { $set: { deleted: true, updatedAt: new Date() } }
    );

    return result.matchedCount > 0;
  } catch {
    return false;
  }
};
