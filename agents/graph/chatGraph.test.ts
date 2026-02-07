import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AIMessage } from '@langchain/core/messages';

vi.mock('@/services/logger/graphLogger', () => ({
  graphLogger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/agents/utils/translations', () => ({
  getAgentTranslations: vi.fn(() => (key: string, params?: Record<string, string | number>) => {
    const translations: Record<string, string> = {
      noQueryDetected: 'No product query detected. Try describing what you are looking for.',
      noProductsFound: 'No products found matching your query.',
      foundProducts: 'Found {count} products:',
      inStock: 'In stock',
      outOfStock: 'Out of stock',
      category: 'Category',
      searchError: 'An error occurred while searching for products. Please try again later.',
      notFound: 'I could not find that product.',
      noReference: 'I am not sure which product you are asking about.',
      noSearchResults: 'I do not have any previous search results.',
      productDetails: 'Product Details',
      price: 'Price',
      specifications: 'Specifications',
      description: 'Description',
      error: 'An error occurred while fetching product details.',
    };
    let result = translations[key] || key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        result = result.replace(`{${k}}`, String(v));
      });
    }
    return result;
  }),
}));

vi.mock('@/clients/weaviate/weaviate', () => ({
  connectToWeaviate: vi.fn(() => Promise.resolve({})),
}));

vi.mock('@/clients/mongodb/mongodb', () => ({
  connectToMongo: vi.fn(() => Promise.resolve({})),
}));

vi.mock('@/models/products/weaviateProductsModel', () => ({
  searchProductIdsInWeaviate: vi.fn(() => Promise.resolve([])),
}));

vi.mock('@/models/products/productsModel', () => ({
  getProductById: vi.fn(() => Promise.resolve(null)),
  findProductByName: vi.fn(() => Promise.resolve(null)),
}));

const mockLlmInvoke = vi.fn();

vi.mock('@/services/llm/llm.service', () => ({
  createOllamaClient: vi.fn(() => ({
    invoke: mockLlmInvoke,
  })),
}));

import { executeChatGraphWithStream, IStreamCallback } from './chatGraph';
import { searchProductIdsInWeaviate } from '@/models/products/weaviateProductsModel';
import { getProductById } from '@/models/products/productsModel';

const mockSearchProductIds = vi.mocked(searchProductIdsInWeaviate);
const mockGetProductById = vi.mocked(getProductById);

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

      expect(result.response).toBe('Hello! How can I help you today?');
      expect(mockCallbacks.onToken).toHaveBeenCalledWith('Hello! How can I help you today?');
    });

    it('should route product query to products agent', async () => {
      mockLlmInvoke
        .mockResolvedValueOnce({ content: 'products' })
        .mockResolvedValueOnce({ content: 'laptop' });

      const result = await executeChatGraphWithStream(
        'session-123',
        'en',
        [{ role: 'user', content: 'Show me laptops' }],
        mockCallbacks
      );

      expect(result.response).toContain('No products found matching your query');
    });

    it('should route to product agent when router returns "product"', async () => {
      mockLlmInvoke
        .mockResolvedValueOnce({ content: 'product' })
        .mockResolvedValueOnce({ content: '{"type": "unknown"}' });

      const result = await executeChatGraphWithStream(
        'session-123',
        'pl',
        [{ role: 'user', content: 'Pokaż szczegóły tego produktu' }],
        mockCallbacks
      );

      expect(result.response).toContain('not sure which product');
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

      expect(result.response).toBe('The weather in Warsaw is sunny, 22°C.');
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

      expect(result.response).toBe('The result of 15 times 3 is 45.');
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

      expect(result.response).toContain('18');
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

      expect(result.response).toContain('laptop');
    });

    it('should return no query detected when LLM returns EMPTY', async () => {
      mockLlmInvoke
        .mockResolvedValueOnce({ content: 'products' })
        .mockResolvedValueOnce({ content: 'EMPTY' });

      const result = await executeChatGraphWithStream(
        'session-123',
        'pl',
        [{ role: 'user', content: 'Cześć' }],
        mockCallbacks
      );

      expect(result.response).toContain('No product query detected');
    });

    it('should return no products found when Weaviate returns empty results', async () => {
      mockLlmInvoke
        .mockResolvedValueOnce({ content: 'products' })
        .mockResolvedValueOnce({ content: 'laptop' });

      const result = await executeChatGraphWithStream(
        'session-123',
        'en',
        [{ role: 'user', content: 'Show me laptops' }],
        mockCallbacks
      );

      expect(result.response).toContain('No products found matching your query');
    });

    it('should return formatted products when found in database', async () => {
      const mockProduct = {
        _id: 'product-1',
        name: 'Gaming Laptop Pro',
        description: 'High performance gaming laptop',
        price: 4999.99,
        sku: 'LAPTOP-001',
        stock: 10,
        category: 'Electronics',
        isActive: true,
        deleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockLlmInvoke
        .mockResolvedValueOnce({ content: 'products' })
        .mockResolvedValueOnce({ content: 'gaming laptop' });

      mockSearchProductIds.mockResolvedValueOnce(['product-1']);
      mockGetProductById.mockResolvedValueOnce(mockProduct);

      const result = await executeChatGraphWithStream(
        'session-123',
        'en',
        [{ role: 'user', content: 'Show me gaming laptops' }],
        mockCallbacks
      );

      expect(result.response).toContain('Found 1 products:');
      expect(result.response).toContain('Gaming Laptop Pro');
      expect(result.response).toContain('4999.99');
      expect(result.response).toContain('Electronics');
      expect(result.response).toContain('In stock');
    });

    it('should filter out deleted and inactive products', async () => {
      const activeProduct = {
        _id: 'product-1',
        name: 'Active Laptop',
        description: 'Available laptop',
        price: 3000,
        sku: 'LAPTOP-001',
        stock: 5,
        category: 'Laptops',
        isActive: true,
        deleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const deletedProduct = {
        _id: 'product-2',
        name: 'Deleted Laptop',
        description: 'Deleted laptop',
        price: 2000,
        sku: 'LAPTOP-002',
        stock: 0,
        category: 'Laptops',
        isActive: true,
        deleted: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const inactiveProduct = {
        _id: 'product-3',
        name: 'Inactive Laptop',
        description: 'Inactive laptop',
        price: 1000,
        sku: 'LAPTOP-003',
        stock: 3,
        category: 'Laptops',
        isActive: false,
        deleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockLlmInvoke
        .mockResolvedValueOnce({ content: 'products' })
        .mockResolvedValueOnce({ content: 'laptop' });

      mockSearchProductIds.mockResolvedValueOnce(['product-1', 'product-2', 'product-3']);
      mockGetProductById
        .mockResolvedValueOnce(activeProduct)
        .mockResolvedValueOnce(deletedProduct)
        .mockResolvedValueOnce(inactiveProduct);

      const result = await executeChatGraphWithStream(
        'session-123',
        'en',
        [{ role: 'user', content: 'Show me laptops' }],
        mockCallbacks
      );

      expect(result.response).toContain('Found 1 products:');
      expect(result.response).toContain('Active Laptop');
      expect(result.response).not.toContain('Deleted Laptop');
      expect(result.response).not.toContain('Inactive Laptop');
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

      expect(result.response).toBe('I can help you with that.');
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

      expect(result.response).toBe('');
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

      expect(result.response).toBe('Sorry, I could not process that request.');
    });
  });
});
