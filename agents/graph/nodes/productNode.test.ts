import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HumanMessage } from '@langchain/core/messages';
import { productNode } from './productNode';
import { IGraphState } from '@/agents/graph/state';
import { IProduct } from '@/domain/product';

vi.mock('@/services/logger/graphLogger', () => ({
  graphLogger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/services/llm/llm.service', () => ({
  createOllamaClient: vi.fn(() => ({
    invoke: vi.fn(),
  })),
}));

vi.mock('@/clients/mongodb/mongodb', () => ({
  connectToMongo: vi.fn(),
}));

vi.mock('@/models/products/productsModel', () => ({
  findProductByName: vi.fn(),
}));

describe('productNode', () => {
  const mockProduct: IProduct = {
    _id: 'test-id-1',
    name: 'Gaming Laptop Pro X1',
    description: 'High-performance gaming laptop with RTX 4080, 32GB RAM, 1TB SSD.',
    price: 4999.99,
    sku: 'LAPTOP-GAMING-001',
    stock: 15,
    category: 'Laptops',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    deleted: false,
    attributes: [
      { name: 'RAM', value: '32', unit: 'GB' },
      { name: 'GPU', value: 'RTX 4080' },
    ],
  };

  describe('productNode integration', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should return noReference when user message is empty', async () => {
      const state: IGraphState = {
        messages: [],
        locale: 'en',
        currentAgent: 'product',
        response: '',
        lastSearchResults: null,
      };

      const result = await productNode(state);

      expect(result.response).toContain('not sure which product');
    });

    it('should return noSearchResults when position reference used without search results', async () => {
      const { createOllamaClient } = await import('@/services/llm/llm.service');
      (createOllamaClient as ReturnType<typeof vi.fn>).mockReturnValue({
        invoke: vi.fn().mockResolvedValue({
          content: '{"type": "position", "position": 1}',
        }),
      });

      const state: IGraphState = {
        messages: [new HumanMessage('What about the first one?')],
        locale: 'en',
        currentAgent: 'product',
        response: '',
        lastSearchResults: null,
      };

      const result = await productNode(state);

      expect(result.response).toContain('do not have any previous search results');
    });

    it('should return product details for valid position reference', async () => {
      const { createOllamaClient } = await import('@/services/llm/llm.service');
      (createOllamaClient as ReturnType<typeof vi.fn>).mockReturnValue({
        invoke: vi.fn().mockResolvedValue({
          content: '{"type": "position", "position": 1}',
        }),
      });

      const state: IGraphState = {
        messages: [new HumanMessage('What about the first one?')],
        locale: 'en',
        currentAgent: 'product',
        response: '',
        lastSearchResults: {
          products: [mockProduct],
          query: 'laptops',
          timestamp: new Date(),
        },
      };

      const result = await productNode(state);

      expect(result.response).toContain('Gaming Laptop Pro X1');
      expect(result.response).toContain('4999.99');
    });

    it('should return notFound for invalid position', async () => {
      const { createOllamaClient } = await import('@/services/llm/llm.service');
      (createOllamaClient as ReturnType<typeof vi.fn>).mockReturnValue({
        invoke: vi.fn().mockResolvedValue({
          content: '{"type": "position", "position": 10}',
        }),
      });

      const state: IGraphState = {
        messages: [new HumanMessage('What about the tenth one?')],
        locale: 'en',
        currentAgent: 'product',
        response: '',
        lastSearchResults: {
          products: [mockProduct],
          query: 'laptops',
          timestamp: new Date(),
        },
      };

      const result = await productNode(state);

      expect(result.response).toContain('could not find that product');
    });

    it('should lookup product by name', async () => {
      const { createOllamaClient } = await import('@/services/llm/llm.service');
      const { findProductByName } = await import('@/models/products/productsModel');
      const { connectToMongo } = await import('@/clients/mongodb/mongodb');

      (createOllamaClient as ReturnType<typeof vi.fn>).mockReturnValue({
        invoke: vi.fn().mockResolvedValue({
          content: '{"type": "name", "name": "Gaming Laptop Pro X1"}',
        }),
      });

      (connectToMongo as ReturnType<typeof vi.fn>).mockResolvedValue({});
      (findProductByName as ReturnType<typeof vi.fn>).mockResolvedValue(mockProduct);

      const state: IGraphState = {
        messages: [new HumanMessage('Tell me about Gaming Laptop Pro X1')],
        locale: 'en',
        currentAgent: 'product',
        response: '',
        lastSearchResults: null,
      };

      const result = await productNode(state);

      expect(result.response).toContain('Gaming Laptop Pro X1');
      expect(findProductByName).toHaveBeenCalled();
    });

    it('should return notFound when product name not found in database', async () => {
      const { createOllamaClient } = await import('@/services/llm/llm.service');
      const { findProductByName } = await import('@/models/products/productsModel');
      const { connectToMongo } = await import('@/clients/mongodb/mongodb');

      (createOllamaClient as ReturnType<typeof vi.fn>).mockReturnValue({
        invoke: vi.fn().mockResolvedValue({
          content: '{"type": "name", "name": "NonExistent Product"}',
        }),
      });

      (connectToMongo as ReturnType<typeof vi.fn>).mockResolvedValue({});
      (findProductByName as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      const state: IGraphState = {
        messages: [new HumanMessage('Tell me about NonExistent Product')],
        locale: 'en',
        currentAgent: 'product',
        response: '',
        lastSearchResults: null,
      };

      const result = await productNode(state);

      expect(result.response).toContain('could not find that product');
    });

    it('should return noReference when reference type is unknown', async () => {
      const { createOllamaClient } = await import('@/services/llm/llm.service');

      (createOllamaClient as ReturnType<typeof vi.fn>).mockReturnValue({
        invoke: vi.fn().mockResolvedValue({
          content: '{"type": "unknown"}',
        }),
      });

      const state: IGraphState = {
        messages: [new HumanMessage('I want to know more')],
        locale: 'en',
        currentAgent: 'product',
        response: '',
        lastSearchResults: null,
      };

      const result = await productNode(state);

      expect(result.response).toContain('not sure which product');
    });
  });
});

