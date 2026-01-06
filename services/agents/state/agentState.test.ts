import { describe, it, expect } from 'vitest';
import { createInitialState, IAgentState } from './agentState';

describe('agentState', () => {
  describe('createInitialState', () => {
    const sessionId = '550e8400-e29b-41d4-a716-446655440000';
    const locale = 'en';
    const userMessage = 'Hello, I need help finding a product';

    it('should create state with user message', () => {
      const state = createInitialState(sessionId, locale, userMessage);

      expect(state.messages).toHaveLength(1);
      expect(state.messages[0].role).toBe('user');
      expect(state.messages[0].content).toBe(userMessage);
    });

    it('should create state with provided sessionId', () => {
      const state = createInitialState(sessionId, locale, userMessage);

      expect(state.sessionId).toBe(sessionId);
    });

    it('should create state with provided locale', () => {
      const state = createInitialState(sessionId, locale, userMessage);

      expect(state.locale).toBe(locale);
    });

    it('should create state with router as initial agent', () => {
      const state = createInitialState(sessionId, locale, userMessage);

      expect(state.currentAgent).toBe('router');
    });

    it('should create state without userId when not provided', () => {
      const state = createInitialState(sessionId, locale, userMessage);

      expect(state.userId).toBeUndefined();
    });

    it('should create state with userId when provided', () => {
      const userId = 'user-123';

      const state = createInitialState(sessionId, locale, userMessage, userId);

      expect(state.userId).toBe(userId);
    });

    it('should handle Polish locale', () => {
      const polishLocale = 'pl';

      const state = createInitialState(sessionId, polishLocale, userMessage);

      expect(state.locale).toBe('pl');
    });

    it('should handle empty string message', () => {
      const emptyMessage = '';

      const state = createInitialState(sessionId, locale, emptyMessage);

      expect(state.messages[0].content).toBe('');
    });

    it('should handle long messages', () => {
      const longMessage = 'a'.repeat(2000);

      const state = createInitialState(sessionId, locale, longMessage);

      expect(state.messages[0].content).toBe(longMessage);
      expect(state.messages[0].content.length).toBe(2000);
    });

    it('should return correct IAgentState structure', () => {
      const userId = 'user-456';

      const state: IAgentState = createInitialState(
        sessionId,
        locale,
        userMessage,
        userId
      );

      expect(state).toEqual({
        messages: [
          {
            role: 'user',
            content: userMessage,
          },
        ],
        sessionId,
        userId,
        locale,
        currentAgent: 'router',
      });
    });

    it('should create independent state objects', () => {
      const state1 = createInitialState(sessionId, locale, 'Message 1');
      const state2 = createInitialState(sessionId, locale, 'Message 2');

      expect(state1.messages[0].content).toBe('Message 1');
      expect(state2.messages[0].content).toBe('Message 2');
      expect(state1.messages).not.toBe(state2.messages);
    });
  });
});
