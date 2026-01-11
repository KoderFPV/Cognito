import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const { mockChatOpenAI } = vi.hoisted(() => {
  return { mockChatOpenAI: vi.fn() };
});

vi.mock('@langchain/openai', () => ({
  ChatOpenAI: mockChatOpenAI,
}));

import { createBielikClient } from './llm.service';

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
      process.env.OLLAMA_MODEL = 'speakleash/bielik-11b-v3.0-instruct:Q8_0';

      expect(() => createBielikClient(0.7, 500)).toThrow(
        'OLLAMA_URL environment variable is not set'
      );
    });

    it('should throw error when OLLAMA_MODEL is not set', () => {
      process.env.OLLAMA_URL = 'http://localhost:2141/v1';
      delete process.env.OLLAMA_MODEL;

      expect(() => createBielikClient(0.7, 500)).toThrow(
        'OLLAMA_MODEL environment variable is not set'
      );
    });
  });

  describe('createBielikClient', () => {
    beforeEach(() => {
      process.env.OLLAMA_URL = 'http://localhost:2141/v1';
      process.env.OLLAMA_MODEL = 'speakleash/bielik-11b-v3.0-instruct:Q8_0';
    });

    it('should create ChatOpenAI client with correct model from env', () => {
      createBielikClient(0.7, 500);

      expect(mockChatOpenAI).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'speakleash/bielik-11b-v3.0-instruct:Q8_0',
        })
      );
    });

    it('should create ChatOpenAI client with provided temperature', () => {
      createBielikClient(0.5, 500);

      expect(mockChatOpenAI).toHaveBeenCalledWith(
        expect.objectContaining({
          temperature: 0.5,
        })
      );
    });

    it('should create ChatOpenAI client with provided maxTokens', () => {
      createBielikClient(0.7, 1000);

      expect(mockChatOpenAI).toHaveBeenCalledWith(
        expect.objectContaining({
          maxTokens: 1000,
        })
      );
    });

    it('should create ChatOpenAI client with correct baseURL', () => {
      createBielikClient(0.7, 500);

      expect(mockChatOpenAI).toHaveBeenCalledWith(
        expect.objectContaining({
          configuration: {
            baseURL: 'http://localhost:2141/v1',
          },
        })
      );
    });

    it('should create ChatOpenAI client with ollama as apiKey', () => {
      createBielikClient(0.7, 500);

      expect(mockChatOpenAI).toHaveBeenCalledWith(
        expect.objectContaining({
          apiKey: 'ollama',
        })
      );
    });
  });
});
