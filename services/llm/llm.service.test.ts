import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const { mockChatOpenAI } = vi.hoisted(() => {
  return { mockChatOpenAI: vi.fn() };
});

vi.mock('@langchain/openai', () => ({
  ChatOpenAI: mockChatOpenAI,
}));

import { createOllamaClient } from './llm.service';

describe('llm.service', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('getOllamaConfig (tested via client creation)', () => {
    it('should throw error when OLLAMA_URL is not set', () => {
      delete process.env.OLLAMA_URL;
      process.env.OLLAMA_MODEL = 'mistral-small3.2:24b-instruct-2506-q8_0';

      expect(() => createOllamaClient(0.7, 500)).toThrow(
        'OLLAMA_URL environment variable is not set'
      );
    });

    it('should throw error when OLLAMA_MODEL is not set', () => {
      process.env.OLLAMA_URL = 'http://localhost:2141/v1';
      delete process.env.OLLAMA_MODEL;

      expect(() => createOllamaClient(0.7, 500)).toThrow(
        'OLLAMA_MODEL environment variable is not set'
      );
    });
  });

  describe('createOllamaClient', () => {
    beforeEach(() => {
      process.env.OLLAMA_URL = 'http://localhost:2141/v1';
      process.env.OLLAMA_MODEL = 'mistral-small3.2:24b-instruct-2506-q8_0';
    });

    it('should create ChatOpenAI client with correct model from env', () => {
      createOllamaClient(0.7, 500);

      expect(mockChatOpenAI).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'mistral-small3.2:24b-instruct-2506-q8_0',
        })
      );
    });

    it('should create ChatOpenAI client with provided temperature', () => {
      createOllamaClient(0.5, 500);

      expect(mockChatOpenAI).toHaveBeenCalledWith(
        expect.objectContaining({
          temperature: 0.5,
        })
      );
    });

    it('should create ChatOpenAI client with provided maxTokens', () => {
      createOllamaClient(0.7, 1000);

      expect(mockChatOpenAI).toHaveBeenCalledWith(
        expect.objectContaining({
          maxTokens: 1000,
        })
      );
    });

    it('should create ChatOpenAI client with correct baseURL', () => {
      createOllamaClient(0.7, 500);

      expect(mockChatOpenAI).toHaveBeenCalledWith(
        expect.objectContaining({
          configuration: {
            baseURL: 'http://localhost:2141/v1',
          },
        })
      );
    });

    it('should create ChatOpenAI client with ollama as apiKey', () => {
      createOllamaClient(0.7, 500);

      expect(mockChatOpenAI).toHaveBeenCalledWith(
        expect.objectContaining({
          apiKey: 'ollama',
        })
      );
    });
  });
});
