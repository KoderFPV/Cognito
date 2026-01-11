import { describe, it, expect } from 'vitest';
import { HumanMessage, AIMessage, SystemMessage, BaseMessage } from '@langchain/core/messages';
import { isHumanMessage, normalizeMessages } from './messageUtils';

describe('messageUtils', () => {
  describe('isHumanMessage', () => {
    it('should return true for HumanMessage instance', () => {
      const message = new HumanMessage('Hello');

      const result = isHumanMessage(message);

      expect(result).toBe(true);
    });

    it('should return false for AIMessage instance', () => {
      const message = new AIMessage('Hello');

      const result = isHumanMessage(message);

      expect(result).toBe(false);
    });

    it('should return false for SystemMessage instance', () => {
      const message = new SystemMessage('System prompt');

      const result = isHumanMessage(message);

      expect(result).toBe(false);
    });

    it('should return true for object with role "human"', () => {
      const message = { role: 'human', content: 'Hello' } as unknown as BaseMessage;

      const result = isHumanMessage(message);

      expect(result).toBe(true);
    });

    it('should return true for object with role "user"', () => {
      const message = { role: 'user', content: 'Hello' } as unknown as BaseMessage;

      const result = isHumanMessage(message);

      expect(result).toBe(true);
    });

    it('should return false for object with role "assistant"', () => {
      const message = { role: 'assistant', content: 'Hello' } as unknown as BaseMessage;

      const result = isHumanMessage(message);

      expect(result).toBe(false);
    });

    it('should return false for object with role "ai"', () => {
      const message = { role: 'ai', content: 'Hello' } as unknown as BaseMessage;

      const result = isHumanMessage(message);

      expect(result).toBe(false);
    });

    it('should return false for object without role', () => {
      const message = { content: 'Hello' } as unknown as BaseMessage;

      const result = isHumanMessage(message);

      expect(result).toBe(false);
    });
  });

  describe('normalizeMessages', () => {
    it('should return HumanMessage instances unchanged', () => {
      const messages = [new HumanMessage('Hello')];

      const result = normalizeMessages(messages);

      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(HumanMessage);
      expect(result[0].content).toBe('Hello');
    });

    it('should return AIMessage instances unchanged', () => {
      const messages = [new AIMessage('Hi there')];

      const result = normalizeMessages(messages);

      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(AIMessage);
      expect(result[0].content).toBe('Hi there');
    });

    it('should return SystemMessage instances unchanged', () => {
      const messages = [new SystemMessage('System prompt')];

      const result = normalizeMessages(messages);

      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(SystemMessage);
      expect(result[0].content).toBe('System prompt');
    });

    it('should convert object with role "human" to HumanMessage', () => {
      const messages = [{ role: 'human', content: 'Hello' }] as unknown as BaseMessage[];

      const result = normalizeMessages(messages);

      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(HumanMessage);
      expect(result[0].content).toBe('Hello');
    });

    it('should convert object with role "user" to HumanMessage', () => {
      const messages = [{ role: 'user', content: 'Hello user' }] as unknown as BaseMessage[];

      const result = normalizeMessages(messages);

      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(HumanMessage);
      expect(result[0].content).toBe('Hello user');
    });

    it('should convert object with role "assistant" to AIMessage', () => {
      const messages = [{ role: 'assistant', content: 'Hello from AI' }] as unknown as BaseMessage[];

      const result = normalizeMessages(messages);

      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(AIMessage);
      expect(result[0].content).toBe('Hello from AI');
    });

    it('should convert object with role "ai" to AIMessage', () => {
      const messages = [{ role: 'ai', content: 'AI response' }] as unknown as BaseMessage[];

      const result = normalizeMessages(messages);

      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(AIMessage);
      expect(result[0].content).toBe('AI response');
    });

    it('should convert unknown objects to HumanMessage with stringified content', () => {
      const messages = [{ unknownField: 'value' }] as unknown as BaseMessage[];

      const result = normalizeMessages(messages);

      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(HumanMessage);
    });

    it('should handle empty content', () => {
      const messages = [{ role: 'human', content: '' }] as unknown as BaseMessage[];

      const result = normalizeMessages(messages);

      expect(result).toHaveLength(1);
      expect(result[0].content).toBe('');
    });

    it('should handle undefined content', () => {
      const messages = [{ role: 'user' }] as unknown as BaseMessage[];

      const result = normalizeMessages(messages);

      expect(result).toHaveLength(1);
      expect(result[0].content).toBe('');
    });

    it('should normalize mixed message types', () => {
      const messages = [
        new HumanMessage('User message'),
        { role: 'assistant', content: 'AI response' },
        new AIMessage('Another AI message'),
        { role: 'user', content: 'Another user message' },
      ] as BaseMessage[];

      const result = normalizeMessages(messages);

      expect(result).toHaveLength(4);
      expect(result[0]).toBeInstanceOf(HumanMessage);
      expect(result[1]).toBeInstanceOf(AIMessage);
      expect(result[2]).toBeInstanceOf(AIMessage);
      expect(result[3]).toBeInstanceOf(HumanMessage);
    });

    it('should return empty array for empty input', () => {
      const result = normalizeMessages([]);

      expect(result).toHaveLength(0);
    });
  });
});
