import { describe, it, expect, beforeEach, vi } from 'vitest';
import { routeMessage } from './routerAgent';
import { IAgentState } from '@/services/agents/state/agentState';

const { mockLlmInvoke } = vi.hoisted(() => {
  return { mockLlmInvoke: vi.fn() };
});

vi.mock('@/services/llm/llm.service', () => ({
  createBielikClient: vi.fn(() => ({
    invoke: mockLlmInvoke,
  })),
}));

describe('routerAgent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('routeMessage', () => {
    it('should return chat when last message is not from user', async () => {
      const state: IAgentState = {
        messages: [{ role: 'assistant', content: 'Hello' }],
        sessionId: 'test-session',
        locale: 'en',
        currentAgent: 'router',
      };

      const result = await routeMessage(state);

      expect(result).toBe('chat');
      expect(mockLlmInvoke).not.toHaveBeenCalled();
    });

    it('should return chat when messages array is empty', async () => {
      const state: IAgentState = {
        messages: [],
        sessionId: 'test-session',
        locale: 'en',
        currentAgent: 'router',
      };

      const result = await routeMessage(state);

      expect(result).toBe('chat');
      expect(mockLlmInvoke).not.toHaveBeenCalled();
    });

    it('should route to chat agent', async () => {
      mockLlmInvoke.mockResolvedValueOnce({ content: 'chat' });

      const state: IAgentState = {
        messages: [{ role: 'user', content: 'Hello, how are you?' }],
        sessionId: 'test-session',
        locale: 'en',
        currentAgent: 'router',
      };

      const result = await routeMessage(state);

      expect(result).toBe('chat');
    });

    it('should route to products agent', async () => {
      mockLlmInvoke.mockResolvedValueOnce({ content: 'products' });

      const state: IAgentState = {
        messages: [{ role: 'user', content: 'Show me laptops under $1000' }],
        sessionId: 'test-session',
        locale: 'en',
        currentAgent: 'router',
      };

      const result = await routeMessage(state);

      expect(result).toBe('products');
    });

    it('should route to product agent', async () => {
      mockLlmInvoke.mockResolvedValueOnce({ content: 'product' });

      const state: IAgentState = {
        messages: [{ role: 'user', content: 'Tell me more about product ABC123' }],
        sessionId: 'test-session',
        locale: 'en',
        currentAgent: 'router',
      };

      const result = await routeMessage(state);

      expect(result).toBe('product');
    });

    it('should return chat for invalid agent response', async () => {
      mockLlmInvoke.mockResolvedValueOnce({ content: 'invalid_agent' });

      const state: IAgentState = {
        messages: [{ role: 'user', content: 'Some message' }],
        sessionId: 'test-session',
        locale: 'en',
        currentAgent: 'router',
      };

      const result = await routeMessage(state);

      expect(result).toBe('chat');
    });

    it('should handle response with extra whitespace', async () => {
      mockLlmInvoke.mockResolvedValueOnce({ content: '  products  \n' });

      const state: IAgentState = {
        messages: [{ role: 'user', content: 'Find running shoes' }],
        sessionId: 'test-session',
        locale: 'en',
        currentAgent: 'router',
      };

      const result = await routeMessage(state);

      expect(result).toBe('products');
    });

    it('should handle response with uppercase', async () => {
      mockLlmInvoke.mockResolvedValueOnce({ content: 'PRODUCT' });

      const state: IAgentState = {
        messages: [{ role: 'user', content: 'What are the specs?' }],
        sessionId: 'test-session',
        locale: 'en',
        currentAgent: 'router',
      };

      const result = await routeMessage(state);

      expect(result).toBe('product');
    });

    it('should pass last 10 messages to LLM', async () => {
      mockLlmInvoke.mockResolvedValueOnce({ content: 'chat' });

      const messages = Array.from({ length: 15 }, (_, i) => ({
        role: i % 2 === 0 ? 'user' as const : 'assistant' as const,
        content: `Message ${i + 1}`,
      }));

      const state: IAgentState = {
        messages,
        sessionId: 'test-session',
        locale: 'en',
        currentAgent: 'router',
      };

      await routeMessage(state);

      const invokedMessages = mockLlmInvoke.mock.calls[0][0];
      expect(invokedMessages).toHaveLength(11);
    });

    it('should include conversation history with user and assistant messages', async () => {
      mockLlmInvoke.mockResolvedValueOnce({ content: 'product' });

      const state: IAgentState = {
        messages: [
          { role: 'user', content: 'Show me laptops' },
          { role: 'assistant', content: 'Here are some laptops...' },
          { role: 'user', content: 'Tell me more about the first one' },
        ],
        sessionId: 'test-session',
        locale: 'en',
        currentAgent: 'router',
      };

      await routeMessage(state);

      const invokedMessages = mockLlmInvoke.mock.calls[0][0];
      expect(invokedMessages).toHaveLength(4);
      expect(invokedMessages[1].content).toBe('Show me laptops');
      expect(invokedMessages[2].content).toBe('Here are some laptops...');
      expect(invokedMessages[3].content).toBe('Tell me more about the first one');
    });

    it('should skip system messages from conversation history', async () => {
      mockLlmInvoke.mockResolvedValueOnce({ content: 'chat' });

      const state: IAgentState = {
        messages: [
          { role: 'system', content: 'System instruction' },
          { role: 'user', content: 'Hello' },
        ],
        sessionId: 'test-session',
        locale: 'en',
        currentAgent: 'router',
      };

      await routeMessage(state);

      const invokedMessages = mockLlmInvoke.mock.calls[0][0];
      expect(invokedMessages).toHaveLength(2);
      expect(invokedMessages[1].content).toBe('Hello');
    });

    it('should work with Polish locale', async () => {
      mockLlmInvoke.mockResolvedValueOnce({ content: 'products' });

      const state: IAgentState = {
        messages: [{ role: 'user', content: 'Pokaż mi laptopy' }],
        sessionId: 'test-session',
        locale: 'pl',
        currentAgent: 'router',
      };

      const result = await routeMessage(state);

      expect(result).toBe('products');
    });

    it('should handle fewer than 10 messages', async () => {
      mockLlmInvoke.mockResolvedValueOnce({ content: 'chat' });

      const state: IAgentState = {
        messages: [
          { role: 'user', content: 'Hello' },
          { role: 'assistant', content: 'Hi there!' },
          { role: 'user', content: 'How are you?' },
        ],
        sessionId: 'test-session',
        locale: 'en',
        currentAgent: 'router',
      };

      await routeMessage(state);

      const invokedMessages = mockLlmInvoke.mock.calls[0][0];
      expect(invokedMessages).toHaveLength(4);
    });
  });
});
