import { MongoClient } from 'mongodb';
import { getMongoDbUri } from '@/services/config/config.service';
import { USERS_COLLECTION } from '@/models/users/usersModel';
import { ROLE, IUser } from '@/domain/user';
import { hashPassword } from '@/services/auth/auth.service';

export const setUserAsAdmin = async (email: string) => {
  const uri = getMongoDbUri();
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db();
    const users = db.collection(USERS_COLLECTION);

    const user = await users.findOne({ email });

    if (!user) {
      throw new Error(`User with email ${email} not found`);
    }

    await users.updateOne({ email }, { $set: { role: ROLE.ADMIN } });
  } finally {
    await client.close();
  }
};

export const createAdminUser = async (email: string, password: string) => {
  const uri = getMongoDbUri();
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db();
    const users = db.collection(USERS_COLLECTION);

    const existingUser = await users.findOne({ email });

    if (existingUser) {
      return;
    }

    const hashedPassword = await hashPassword(password);

    const adminUser: Omit<IUser, '_id'> = {
      email,
      hash: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      phone: '',
      address: '',
      city: '',
      postal: '',
      country: '',
      role: ROLE.ADMIN,
      activated: true,
      deleted: false,
      banned: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await users.insertOne(adminUser as any);
  } finally {
    await client.close();
  }
};

export const deleteUser = async (email: string) => {
  const uri = getMongoDbUri();
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db();
    const users = db.collection(USERS_COLLECTION);

    await users.deleteOne({ email });
  } finally {
    await client.close();
  }
};
