import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Db } from 'mongodb';
import {
  createConversation,
  getConversationBySessionId,
  addMessageToConversation,
  getConversationHistory,
  deleteConversation,
} from './conversationsModel';
import { setupMongoTest, teardownMongoTest, IMongoTestContext } from '@/test/utils/mongoTestUtils';

vi.mock('@/clients/mongodb/mongodb', () => ({
  connectToMongo: vi.fn(),
}));

describe('conversationsModel', () => {
  let context: IMongoTestContext;
  let db: Db;

  beforeEach(async () => {
    context = await setupMongoTest();
    db = context.db;

    const { connectToMongo } = await import('@/clients/mongodb/mongodb');
    vi.mocked(connectToMongo).mockResolvedValue(db);
  });

  afterEach(async () => {
    await teardownMongoTest(context);
    vi.clearAllMocks();
  });

  describe('createConversation', () => {
    it('should create a new conversation', async () => {
      const sessionId = 'session-123';
      const locale = 'en';

      const conversation = await createConversation(sessionId, locale);

      expect(conversation).toBeDefined();
      expect(conversation._id).toBeDefined();
      expect(conversation.sessionId).toBe(sessionId);
      expect(conversation.locale).toBe(locale);
      expect(conversation.messages).toEqual([]);
      expect(conversation.deleted).toBe(false);
    });

    it('should create conversation with userId', async () => {
      const sessionId = 'session-456';
      const locale = 'pl';
      const userId = 'user-789';

      const conversation = await createConversation(sessionId, locale, userId);

      expect(conversation.userId).toBe(userId);
    });
  });

  describe('getConversationBySessionId', () => {
    it('should find conversation by sessionId', async () => {
      const sessionId = 'session-find';
      await createConversation(sessionId, 'en');

      const found = await getConversationBySessionId(sessionId);

      expect(found).toBeDefined();
      expect(found?.sessionId).toBe(sessionId);
    });

    it('should return null for non-existent session', async () => {
      const found = await getConversationBySessionId('non-existent');

      expect(found).toBeNull();
    });

    it('should not find deleted conversation', async () => {
      const sessionId = 'session-deleted';
      await createConversation(sessionId, 'en');
      await deleteConversation(sessionId);

      const found = await getConversationBySessionId(sessionId);

      expect(found).toBeNull();
    });
  });

  describe('addMessageToConversation', () => {
    it('should add user message to conversation', async () => {
      const sessionId = 'session-msg';
      await createConversation(sessionId, 'en');

      const message = {
        role: 'user' as const,
        content: 'Hello AI',
        timestamp: new Date(),
      };

      const updated = await addMessageToConversation(sessionId, message);

      expect(updated.messages).toHaveLength(1);
      expect(updated.messages[0].role).toBe('user');
      expect(updated.messages[0].content).toBe('Hello AI');
      expect(updated.messages[0]._id).toBeDefined();
    });

    it('should add assistant message to conversation', async () => {
      const sessionId = 'session-assistant';
      await createConversation(sessionId, 'en');

      const message = {
        role: 'assistant' as const,
        content: 'Hello human',
        timestamp: new Date(),
      };

      const updated = await addMessageToConversation(sessionId, message);

      expect(updated.messages).toHaveLength(1);
      expect(updated.messages[0].role).toBe('assistant');
    });

    it('should append multiple messages', async () => {
      const sessionId = 'session-multi';
      await createConversation(sessionId, 'en');

      await addMessageToConversation(sessionId, {
        role: 'user',
        content: 'First message',
        timestamp: new Date(),
      });

      const updated = await addMessageToConversation(sessionId, {
        role: 'assistant',
        content: 'Second message',
        timestamp: new Date(),
      });

      expect(updated.messages).toHaveLength(2);
    });

    it('should throw error for non-existent conversation', async () => {
      await expect(
        addMessageToConversation('non-existent', {
          role: 'user',
          content: 'Test',
          timestamp: new Date(),
        })
      ).rejects.toThrow('Conversation not found');
    });
  });

  describe('getConversationHistory', () => {
    it('should return limited message history', async () => {
      const sessionId = 'session-history';
      await createConversation(sessionId, 'en');

      for (let i = 0; i < 5; i++) {
        await addMessageToConversation(sessionId, {
          role: i % 2 === 0 ? 'user' : 'assistant',
          content: `Message ${i}`,
          timestamp: new Date(),
        });
      }

      const history = await getConversationHistory(sessionId, 3);

      expect(history).toHaveLength(3);
      expect(history[0].content).toBe('Message 2');
      expect(history[2].content).toBe('Message 4');
    });

    it('should return empty array for non-existent conversation', async () => {
      const history = await getConversationHistory('non-existent', 10);

      expect(history).toEqual([]);
    });

    it('should return all messages if limit exceeds count', async () => {
      const sessionId = 'session-all';
      await createConversation(sessionId, 'en');

      await addMessageToConversation(sessionId, {
        role: 'user',
        content: 'Only message',
        timestamp: new Date(),
      });

      const history = await getConversationHistory(sessionId, 100);

      expect(history).toHaveLength(1);
    });
  });

  describe('deleteConversation', () => {
    it('should soft delete conversation', async () => {
      const sessionId = 'session-delete';
      await createConversation(sessionId, 'en');

      const result = await deleteConversation(sessionId);

      expect(result).toBe(true);

      const found = await getConversationBySessionId(sessionId);
      expect(found).toBeNull();
    });

    it('should return false for non-existent conversation', async () => {
      const result = await deleteConversation('non-existent');

      expect(result).toBe(false);
    });

    it('should return false when deleting already deleted conversation', async () => {
      const sessionId = 'session-double-delete';
      await createConversation(sessionId, 'en');

      await deleteConversation(sessionId);
      const result = await deleteConversation(sessionId);

      expect(result).toBe(false);
    });
  });
});
