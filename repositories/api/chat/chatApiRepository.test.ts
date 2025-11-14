import { describe, it, expect, beforeEach, vi } from 'vitest';
import { sendMessageToChat } from './chatApiRepository';

describe('chatApiRepository', () => {
  const mockFetch = vi.fn();
  global.fetch = mockFetch as any;

  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe('sendMessageToChat', () => {
    it('should send message with valid data', async () => {
      const messageData = {
        message: 'Hello, this is a test message',
      };

      const mockResponse = {
        message: 'Response from AI',
        messageId: 'msg-123',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await sendMessageToChat(messageData);

      expect(mockFetch).toHaveBeenCalledWith('/api/chat/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData),
      });
      expect(result).toEqual(mockResponse);
    });

    it('should send correct headers', async () => {
      const messageData = {
        message: 'Test message',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          message: 'Response',
          messageId: 'msg-123',
        }),
      });

      await sendMessageToChat(messageData);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json',
          },
        })
      );
    });

    it('should use POST method', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          message: 'Response',
          messageId: 'msg-123',
        }),
      });

      await sendMessageToChat({ message: 'Test' });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
        })
      );
    });

    it('should call correct endpoint', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          message: 'Response',
          messageId: 'msg-123',
        }),
      });

      await sendMessageToChat({ message: 'Test' });

      expect(mockFetch).toHaveBeenCalledWith('/api/chat/send', expect.any(Object));
    });

    it('should handle successful response', async () => {
      const expectedResponse = {
        message: 'AI generated message',
        messageId: 'msg-456',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => expectedResponse,
      });

      const result = await sendMessageToChat({ message: 'Hello' });

      expect(result).toEqual(expectedResponse);
    });

    it('should throw error on failed response', async () => {
      const errorData = {
        error: 'Failed to process message',
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => errorData,
      });

      await expect(sendMessageToChat({ message: 'Hello' })).rejects.toThrow();
    });

    it('should throw with error message from response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          error: 'Custom error message',
        }),
      });

      await expect(sendMessageToChat({ message: 'Hello' })).rejects.toThrow(
        'Custom error message'
      );
    });

    it('should throw with default message if no error in response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({}),
      });

      await expect(sendMessageToChat({ message: 'Hello' })).rejects.toThrow(
        'Failed to send message'
      );
    });

    it('should handle network error', async () => {
      const networkError = new Error('Network request failed');
      mockFetch.mockRejectedValueOnce(networkError);

      await expect(sendMessageToChat({ message: 'Hello' })).rejects.toThrow(
        'Network request failed'
      );
    });

    it('should handle fetch with empty message', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          message: 'Response',
          messageId: 'msg-789',
        }),
      });

      const result = await sendMessageToChat({ message: '' });

      expect(mockFetch).toHaveBeenCalled();
      expect(result).toHaveProperty('messageId');
    });

    it('should handle long message', async () => {
      const longMessage = 'a'.repeat(1000);
      const messageData = { message: longMessage };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          message: 'Response to long message',
          messageId: 'msg-long',
        }),
      });

      const result = await sendMessageToChat(messageData);

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/chat/send',
        expect.objectContaining({
          body: JSON.stringify(messageData),
        })
      );
      expect(result).toHaveProperty('message');
    });

    it('should handle special characters in message', async () => {
      const specialMessage = 'Hello! @#$%^&*() "quoted" \'single\'';
      const messageData = { message: specialMessage };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          message: 'Response',
          messageId: 'msg-special',
        }),
      });

      await sendMessageToChat(messageData);

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/chat/send',
        expect.objectContaining({
          body: JSON.stringify(messageData),
        })
      );
    });

    it('should handle response with extra fields', async () => {
      const responseWithExtra = {
        message: 'Response',
        messageId: 'msg-extra',
        timestamp: '2025-01-01T00:00:00Z',
        metadata: { source: 'ai' },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => responseWithExtra,
      });

      const result = await sendMessageToChat({ message: 'Hello' });

      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('messageId');
    });

    it('should send message correctly multiple times', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          message: 'Response',
          messageId: 'msg-id',
        }),
      });

      await sendMessageToChat({ message: 'First' });
      await sendMessageToChat({ message: 'Second' });
      await sendMessageToChat({ message: 'Third' });

      expect(mockFetch).toHaveBeenCalledTimes(3);
    });

    it('should not modify input data', async () => {
      const originalData = {
        message: 'Test message',
      };

      const dataCopy = { ...originalData };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          message: 'Response',
          messageId: 'msg-123',
        }),
      });

      await sendMessageToChat(originalData);

      expect(originalData).toEqual(dataCopy);
    });

    it('should handle 4xx client errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          error: 'Bad request',
        }),
      });

      await expect(sendMessageToChat({ message: 'Hello' })).rejects.toThrow(
        'Bad request'
      );
    });

    it('should handle 5xx server errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({
          error: 'Internal server error',
        }),
      });

      await expect(sendMessageToChat({ message: 'Hello' })).rejects.toThrow(
        'Internal server error'
      );
    });
  });
});
