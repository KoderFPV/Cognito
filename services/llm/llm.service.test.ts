import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const { mockChatOpenAI } = vi.hoisted(() => {
  return { mockChatOpenAI: vi.fn() };
});

vi.mock('@langchain/openai', () => ({
  ChatOpenAI: mockChatOpenAI,
}));

import { createQwen3VLClient, createQwen3Client } from './llm.service';

describe('llm.service', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('getVllmConfig (tested via client creation)', () => {
    it('should throw error when VLLM_QWEN3_VL_URL is not set', () => {
      delete process.env.VLLM_QWEN3_VL_URL;
      process.env.VLLM_QWEN3_URL = 'http://localhost:2142/v1';
      process.env.VLLM_API_KEY = 'test-key';

      expect(() => createQwen3VLClient(0.7, 500)).toThrow(
        'VLLM_QWEN3_VL_URL environment variable is not set'
      );
    });

    it('should throw error when VLLM_QWEN3_URL is not set', () => {
      process.env.VLLM_QWEN3_VL_URL = 'http://localhost:2141/v1';
      delete process.env.VLLM_QWEN3_URL;
      process.env.VLLM_API_KEY = 'test-key';

      expect(() => createQwen3Client(0.7, 500)).toThrow(
        'VLLM_QWEN3_URL environment variable is not set'
      );
    });

    it('should throw error when VLLM_API_KEY is not set', () => {
      process.env.VLLM_QWEN3_VL_URL = 'http://localhost:2141/v1';
      process.env.VLLM_QWEN3_URL = 'http://localhost:2142/v1';
      delete process.env.VLLM_API_KEY;

      expect(() => createQwen3VLClient(0.7, 500)).toThrow(
        'VLLM_API_KEY environment variable is not set'
      );
    });
  });

  describe('createQwen3VLClient', () => {
    beforeEach(() => {
      process.env.VLLM_QWEN3_VL_URL = 'http://localhost:2141/v1';
      process.env.VLLM_QWEN3_URL = 'http://localhost:2142/v1';
      process.env.VLLM_API_KEY = 'test-api-key';
    });

    it('should create ChatOpenAI client with correct model', () => {
      createQwen3VLClient(0.7, 500);

      expect(mockChatOpenAI).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'Qwen/Qwen3-VL-8B-Instruct-FP8',
        })
      );
    });

    it('should create ChatOpenAI client with provided temperature', () => {
      createQwen3VLClient(0.5, 500);

      expect(mockChatOpenAI).toHaveBeenCalledWith(
        expect.objectContaining({
          temperature: 0.5,
        })
      );
    });

    it('should create ChatOpenAI client with provided maxTokens', () => {
      createQwen3VLClient(0.7, 1000);

      expect(mockChatOpenAI).toHaveBeenCalledWith(
        expect.objectContaining({
          maxTokens: 1000,
        })
      );
    });

    it('should create ChatOpenAI client with correct baseURL', () => {
      createQwen3VLClient(0.7, 500);

      expect(mockChatOpenAI).toHaveBeenCalledWith(
        expect.objectContaining({
          configuration: {
            baseURL: 'http://localhost:2141/v1',
          },
        })
      );
    });

    it('should create ChatOpenAI client with apiKey from environment', () => {
      createQwen3VLClient(0.7, 500);

      expect(mockChatOpenAI).toHaveBeenCalledWith(
        expect.objectContaining({
          apiKey: 'test-api-key',
        })
      );
    });
  });

  describe('createQwen3Client', () => {
    beforeEach(() => {
      process.env.VLLM_QWEN3_VL_URL = 'http://localhost:2141/v1';
      process.env.VLLM_QWEN3_URL = 'http://localhost:2142/v1';
      process.env.VLLM_API_KEY = 'test-api-key';
    });

    it('should create ChatOpenAI client with correct model', () => {
      createQwen3Client(0.7, 500);

      expect(mockChatOpenAI).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'Qwen/Qwen3-8B-FP8',
        })
      );
    });

    it('should create ChatOpenAI client with provided temperature', () => {
      createQwen3Client(0.3, 500);

      expect(mockChatOpenAI).toHaveBeenCalledWith(
        expect.objectContaining({
          temperature: 0.3,
        })
      );
    });

    it('should create ChatOpenAI client with provided maxTokens', () => {
      createQwen3Client(0.7, 2000);

      expect(mockChatOpenAI).toHaveBeenCalledWith(
        expect.objectContaining({
          maxTokens: 2000,
        })
      );
    });

    it('should create ChatOpenAI client with correct baseURL', () => {
      createQwen3Client(0.7, 500);

      expect(mockChatOpenAI).toHaveBeenCalledWith(
        expect.objectContaining({
          configuration: {
            baseURL: 'http://localhost:2142/v1',
          },
        })
      );
    });

    it('should create ChatOpenAI client with apiKey from environment', () => {
      createQwen3Client(0.7, 500);

      expect(mockChatOpenAI).toHaveBeenCalledWith(
        expect.objectContaining({
          apiKey: 'test-api-key',
        })
      );
    });
  });
});
