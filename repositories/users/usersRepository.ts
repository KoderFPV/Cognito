import { ObjectId } from 'mongodb';
import { IUser } from '@/domain/user';
import { connectToMongo } from '@/clients/mongodb/mongodb';

export const findUserByEmail = async (
  email: string
): Promise<IUser | null> => {
  const db = await connectToMongo();
  const collection = db.collection<IUser>('users');
  return collection.findOne({ email, deleted: false });
};

export const findUserById = async (
  id: string
): Promise<IUser | null> => {
  const db = await connectToMongo();
  const collection = db.collection<IUser>('users');

  try {
    const objectId = new ObjectId(id);
    const user = await collection.findOne({ _id: objectId as any, deleted: false });

    if (!user) {
      return null;
    }

    return {
      ...user,
      _id: user._id.toString(),
    };
  } catch {
    return null;
  }
};

export const createUser = async (
  userData: Omit<IUser, '_id'>
): Promise<IUser> => {
  const db = await connectToMongo();
  const collection = db.collection<IUser>('users');
  const result = await collection.insertOne(userData as any);

  return {
    ...userData,
    _id: result.insertedId.toString(),
  };
};
