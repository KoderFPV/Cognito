import { MongoClient } from 'mongodb';
import { getMongoDbUri } from '@/services/config/config.service';
import { USERS_COLLECTION } from '@/models/users/usersModel';
import { ROLE } from '@/domain/user';

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
