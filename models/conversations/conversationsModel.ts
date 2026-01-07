import { ObjectId } from 'mongodb';
import { IConversation, IMessage } from '@/domain/conversation';
import { connectToMongo } from '@/clients/mongodb/mongodb';

export const CONVERSATIONS_COLLECTION = 'conversations';

export const createConversation = async (
  sessionId: string,
  locale: string,
  userId?: string
): Promise<IConversation> => {
  const db = await connectToMongo();
  const collection = db.collection<IConversation>(CONVERSATIONS_COLLECTION);

  const now = new Date();
  const conversation: Omit<IConversation, '_id'> = {
    sessionId,
    userId,
    locale,
    messages: [],
    createdAt: now,
    updatedAt: now,
    deleted: false,
  };

  const result = await collection.insertOne(conversation as any);

  return {
    ...conversation,
    _id: result.insertedId.toString(),
  };
};

export const getConversationBySessionId = async (
  sessionId: string
): Promise<IConversation | null> => {
  const db = await connectToMongo();
  const collection = db.collection<IConversation>(CONVERSATIONS_COLLECTION);

  const conversation = await collection.findOne({ sessionId, deleted: false });

  if (!conversation) {
    return null;
  }

  return {
    ...conversation,
    _id: conversation._id.toString(),
  };
};

export const addMessageToConversation = async (
  sessionId: string,
  message: Omit<IMessage, '_id'>
): Promise<IConversation> => {
  const db = await connectToMongo();
  const collection = db.collection<IConversation>(CONVERSATIONS_COLLECTION);

  const messageWithId: IMessage = {
    ...message,
    _id: new ObjectId().toString(),
  };

  const result = await collection.findOneAndUpdate(
    { sessionId, deleted: false },
    {
      $push: { messages: messageWithId },
      $set: { updatedAt: new Date() },
    },
    { returnDocument: 'after' }
  );

  if (!result) {
    throw new Error('Conversation not found');
  }

  return {
    ...result,
    _id: result._id.toString(),
  };
};

export const getConversationHistory = async (
  sessionId: string,
  limit: number
): Promise<IMessage[]> => {
  const db = await connectToMongo();
  const collection = db.collection<IConversation>(CONVERSATIONS_COLLECTION);

  const conversation = await collection.findOne(
    { sessionId, deleted: false },
    { projection: { messages: { $slice: -limit } } }
  );

  if (!conversation) {
    return [];
  }

  return conversation.messages;
};

export const deleteConversation = async (
  sessionId: string
): Promise<boolean> => {
  const db = await connectToMongo();
  const collection = db.collection<IConversation>(CONVERSATIONS_COLLECTION);

  const result = await collection.updateOne(
    { sessionId, deleted: false },
    { $set: { deleted: true, updatedAt: new Date() } }
  );

  return result.modifiedCount > 0;
};
