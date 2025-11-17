import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getMongoDbUri, getWeaviateUrl } from './config.service';

describe('config.service', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('getMongoDbUri', () => {
    it('should return MongoDB URI from environment', () => {
      process.env.MONGODB_URI = 'mongodb://localhost:27017/cognito';

      const uri = getMongoDbUri();

      expect(uri).toBe('mongodb://localhost:27017/cognito');
    });

    it('should accept mongodb+srv:// protocol', () => {
      process.env.MONGODB_URI = 'mongodb+srv://cluster.mongodb.net/cognito';

      const uri = getMongoDbUri();

      expect(uri).toBe('mongodb+srv://cluster.mongodb.net/cognito');
    });

    it('should throw error when MONGODB_URI is not set', () => {
      delete process.env.MONGODB_URI;

      expect(() => getMongoDbUri()).toThrow('MONGODB_URI environment variable is required');
    });

    it('should throw error when MONGODB_URI is empty', () => {
      process.env.MONGODB_URI = '';

      expect(() => getMongoDbUri()).toThrow('MONGODB_URI environment variable is required');
    });

    it('should throw error when MONGODB_URI is only whitespace', () => {
      process.env.MONGODB_URI = '   ';

      expect(() => getMongoDbUri()).toThrow('MONGODB_URI environment variable is required');
    });

    it('should throw error when MONGODB_URI has invalid protocol', () => {
      process.env.MONGODB_URI = 'http://localhost:27017/cognito';

      expect(() => getMongoDbUri()).toThrow(
        'MONGODB_URI must start with mongodb:// or mongodb+srv://'
      );
    });

    it('should throw error when MONGODB_URI has no protocol', () => {
      process.env.MONGODB_URI = 'localhost:27017/cognito';

      expect(() => getMongoDbUri()).toThrow(
        'MONGODB_URI must start with mongodb:// or mongodb+srv://'
      );
    });

    it('should handle MongoDB URI with authentication', () => {
      process.env.MONGODB_URI = 'mongodb://user:password@localhost:27017/cognito';

      const uri = getMongoDbUri();

      expect(uri).toBe('mongodb://user:password@localhost:27017/cognito');
    });

    it('should handle MongoDB URI with query parameters', () => {
      process.env.MONGODB_URI = 'mongodb://localhost:27017/cognito?retryWrites=true&w=majority';

      const uri = getMongoDbUri();

      expect(uri).toBe('mongodb://localhost:27017/cognito?retryWrites=true&w=majority');
    });
  });

  describe('getWeaviateUrl', () => {
    it('should return Weaviate URL from environment', () => {
      process.env.WEAVIATE_URL = 'http://localhost:8080';

      const url = getWeaviateUrl();

      expect(url).toBe('http://localhost:8080');
    });

    it('should accept https protocol', () => {
      process.env.WEAVIATE_URL = 'https://weaviate.example.com';

      const url = getWeaviateUrl();

      expect(url).toBe('https://weaviate.example.com');
    });

    it('should throw error when WEAVIATE_URL is not set', () => {
      delete process.env.WEAVIATE_URL;

      expect(() => getWeaviateUrl()).toThrow('WEAVIATE_URL environment variable is required');
    });

    it('should throw error when WEAVIATE_URL is empty', () => {
      process.env.WEAVIATE_URL = '';

      expect(() => getWeaviateUrl()).toThrow('WEAVIATE_URL environment variable is required');
    });

    it('should throw error when WEAVIATE_URL is only whitespace', () => {
      process.env.WEAVIATE_URL = '   ';

      expect(() => getWeaviateUrl()).toThrow('WEAVIATE_URL environment variable is required');
    });

    it('should throw error when WEAVIATE_URL has invalid protocol', () => {
      process.env.WEAVIATE_URL = 'ftp://weaviate.example.com';

      expect(() => getWeaviateUrl()).toThrow('WEAVIATE_URL must start with http:// or https://');
    });

    it('should throw error when WEAVIATE_URL has no protocol', () => {
      process.env.WEAVIATE_URL = 'localhost:8080';

      expect(() => getWeaviateUrl()).toThrow('WEAVIATE_URL must start with http:// or https://');
    });

    it('should handle Weaviate URL with port', () => {
      process.env.WEAVIATE_URL = 'http://localhost:8080';

      const url = getWeaviateUrl();

      expect(url).toBe('http://localhost:8080');
    });

    it('should handle Weaviate URL with path', () => {
      process.env.WEAVIATE_URL = 'https://weaviate.example.com/v1';

      const url = getWeaviateUrl();

      expect(url).toBe('https://weaviate.example.com/v1');
    });
  });
});
