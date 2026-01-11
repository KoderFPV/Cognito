import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AIMessage } from '@langchain/core/messages';

vi.mock('@/services/logger/graphLogger', () => ({
  graphLogger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

const mockLlmInvoke = vi.fn();

vi.mock('@/services/llm/llm.service', () => ({
  createBielikClient: vi.fn(() => ({
    invoke: mockLlmInvoke,
  })),
}));

import { executeChatGraphWithStream, IStreamCallback } from './chatGraph';

describe('chatGraph', () => {
  let mockCallbacks: IStreamCallback;

  beforeEach(() => {
    vi.clearAllMocks();
    mockCallbacks = {
      onToken: vi.fn(),
      onComplete: vi.fn(),
      onError: vi.fn(),
    };
  });

  describe('executeChatGraphWithStream', () => {
    it('should route general greeting to chat agent', async () => {
      mockLlmInvoke
        .mockResolvedValueOnce({ content: 'chat' })
        .mockResolvedValueOnce({ content: 'Hello! How can I help you today?' });

      const result = await executeChatGraphWithStream(
        'session-123',
        'en',
        [{ role: 'user', content: 'Hello' }],
        mockCallbacks
      );

      expect(result).toBe('Hello! How can I help you today?');
      expect(mockCallbacks.onToken).toHaveBeenCalledWith('Hello! How can I help you today?');
    });

    it('should route product query to products agent', async () => {
      mockLlmInvoke.mockResolvedValueOnce({ content: 'products' });

      const result = await executeChatGraphWithStream(
        'session-123',
        'en',
        [{ role: 'user', content: 'Show me laptops' }],
        mockCallbacks
      );

      expect(result).toContain('Product search functionality');
    });

    it('should route to products agent when router returns "product"', async () => {
      mockLlmInvoke.mockResolvedValueOnce({ content: 'product' });

      const result = await executeChatGraphWithStream(
        'session-123',
        'pl',
        [{ role: 'user', content: 'Pokaż szczegóły tego produktu' }],
        mockCallbacks
      );

      expect(result).toContain('implementacji');
    });

    it('should handle tool call and execute weather tool', async () => {
      mockLlmInvoke
        .mockResolvedValueOnce({ content: 'chat' })
        .mockResolvedValueOnce({
          content: '<tool_call> {"name":"get_weather","arguments":{"city":"Warszawa"}} </tool_call>',
        })
        .mockResolvedValueOnce({
          content: 'The weather in Warsaw is sunny, 22°C.',
        });

      const result = await executeChatGraphWithStream(
        'session-123',
        'en',
        [{ role: 'user', content: 'What is the weather in Warsaw?' }],
        mockCallbacks
      );

      expect(result).toBe('The weather in Warsaw is sunny, 22°C.');
      expect(mockLlmInvoke).toHaveBeenCalledTimes(3);
    });

    it('should handle tool call and execute calculator tool', async () => {
      mockLlmInvoke
        .mockResolvedValueOnce({ content: 'chat' })
        .mockResolvedValueOnce({
          content: '<tool_call> {"name":"calculator","arguments":{"expression":"15*3"}} </tool_call>',
        })
        .mockResolvedValueOnce({
          content: 'The result of 15 times 3 is 45.',
        });

      const result = await executeChatGraphWithStream(
        'session-123',
        'en',
        [{ role: 'user', content: 'What is 15 times 3?' }],
        mockCallbacks
      );

      expect(result).toBe('The result of 15 times 3 is 45.');
    });

    it('should handle multiple tool calls in sequence', async () => {
      mockLlmInvoke
        .mockResolvedValueOnce({ content: 'chat' })
        .mockResolvedValueOnce({
          content: `<tool_call> {"name":"get_weather","arguments":{"city":"Kraków"}} </tool_call>
                    <tool_call> {"name":"calculator","arguments":{"expression":"20-2"}} </tool_call>`,
        })
        .mockResolvedValueOnce({
          content: 'Weather in Kraków is cloudy at 18°C, and 20 minus 2 equals 18.',
        });

      const result = await executeChatGraphWithStream(
        'session-123',
        'en',
        [{ role: 'user', content: 'Weather in Kraków and calculate 20-2' }],
        mockCallbacks
      );

      expect(result).toContain('18');
    });

    it('should call onError callback when graph execution fails', async () => {
      mockLlmInvoke.mockRejectedValueOnce(new Error('LLM connection failed'));

      await expect(
        executeChatGraphWithStream(
          'session-123',
          'en',
          [{ role: 'user', content: 'Hello' }],
          mockCallbacks
        )
      ).rejects.toThrow('LLM connection failed');

      expect(mockCallbacks.onError).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should handle conversation history', async () => {
      mockLlmInvoke
        .mockResolvedValueOnce({ content: 'chat' })
        .mockResolvedValueOnce({ content: 'You mentioned laptops earlier. Would you like more details?' });

      const result = await executeChatGraphWithStream(
        'session-123',
        'en',
        [
          { role: 'user', content: 'I am looking for a laptop' },
          { role: 'assistant', content: 'I can help you find laptops.' },
          { role: 'user', content: 'Tell me more' },
        ],
        mockCallbacks
      );

      expect(result).toContain('laptop');
    });

    it('should use Polish locale for products fallback message', async () => {
      mockLlmInvoke.mockResolvedValueOnce({ content: 'products' });

      const result = await executeChatGraphWithStream(
        'session-123',
        'pl',
        [{ role: 'user', content: 'Pokaż mi laptopy' }],
        mockCallbacks
      );

      expect(result).toContain('Funkcja wyszukiwania produktów');
    });

    it('should use English locale for products fallback message', async () => {
      mockLlmInvoke.mockResolvedValueOnce({ content: 'products' });

      const result = await executeChatGraphWithStream(
        'session-123',
        'en',
        [{ role: 'user', content: 'Show me laptops' }],
        mockCallbacks
      );

      expect(result).toContain('Product search functionality');
    });

    it('should default to chat when router returns unknown agent', async () => {
      mockLlmInvoke
        .mockResolvedValueOnce({ content: 'unknown_agent' })
        .mockResolvedValueOnce({ content: 'I can help you with that.' });

      const result = await executeChatGraphWithStream(
        'session-123',
        'en',
        [{ role: 'user', content: 'Something random' }],
        mockCallbacks
      );

      expect(result).toBe('I can help you with that.');
    });

    it('should handle empty response from LLM', async () => {
      mockLlmInvoke
        .mockResolvedValueOnce({ content: 'chat' })
        .mockResolvedValueOnce({ content: '' });

      const result = await executeChatGraphWithStream(
        'session-123',
        'en',
        [{ role: 'user', content: 'Test' }],
        mockCallbacks
      );

      expect(result).toBe('');
      expect(mockCallbacks.onToken).toHaveBeenCalledWith('');
    });

    it('should handle unknown tool gracefully', async () => {
      mockLlmInvoke
        .mockResolvedValueOnce({ content: 'chat' })
        .mockResolvedValueOnce({
          content: '<tool_call> {"name":"unknown_tool","arguments":{}} </tool_call>',
        })
        .mockResolvedValueOnce({
          content: 'Sorry, I could not process that request.',
        });

      const result = await executeChatGraphWithStream(
        'session-123',
        'en',
        [{ role: 'user', content: 'Do something unknown' }],
        mockCallbacks
      );

      expect(result).toBe('Sorry, I could not process that request.');
    });
  });
});
