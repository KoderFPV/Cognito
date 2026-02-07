import { describe, it, expect, vi } from 'vitest';
import { AIMessage, HumanMessage } from '@langchain/core/messages';
import { routeAfterRouter, shouldContinue } from './edges';
import { IGraphState } from './state';

vi.mock('@/services/logger/graphLogger', () => ({
  graphLogger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe('edges', () => {
  describe('routeAfterRouter', () => {
    it('should route to products when currentAgent is "products"', () => {
      const state: IGraphState = {
        messages: [],
        locale: 'en',
        currentAgent: 'products',
        response: '',
        lastSearchResults: null,
      };

      const result = routeAfterRouter(state);

      expect(result).toBe('products');
    });

    it('should route to product when currentAgent is "product"', () => {
      const state: IGraphState = {
        messages: [],
        locale: 'en',
        currentAgent: 'product',
        response: '',
        lastSearchResults: null,
      };

      const result = routeAfterRouter(state);

      expect(result).toBe('product');
    });

    it('should route to chat when currentAgent is "chat"', () => {
      const state: IGraphState = {
        messages: [],
        locale: 'en',
        currentAgent: 'chat',
        response: '',
        lastSearchResults: null,
      };

      const result = routeAfterRouter(state);

      expect(result).toBe('chat');
    });

    it('should route to chat when currentAgent is empty', () => {
      const state: IGraphState = {
        messages: [],
        locale: 'en',
        currentAgent: '',
        response: '',
        lastSearchResults: null,
      };

      const result = routeAfterRouter(state);

      expect(result).toBe('chat');
    });

    it('should route to chat for unknown agent', () => {
      const state: IGraphState = {
        messages: [],
        locale: 'en',
        currentAgent: 'unknown',
        response: '',
        lastSearchResults: null,
      };

      const result = routeAfterRouter(state);

      expect(result).toBe('chat');
    });
  });

  describe('shouldContinue', () => {
    it('should return "tools" when last message contains tool call', () => {
      const state: IGraphState = {
        messages: [
          new AIMessage('<tool_call> {"name":"get_weather","arguments":{"city":"Warszawa"}} </tool_call>'),
        ],
        locale: 'en',
        currentAgent: 'chat',
        response: '',
        lastSearchResults: null,
      };

      const result = shouldContinue(state);

      expect(result).toBe('tools');
    });

    it('should return "tools" when message contains multiple tool calls', () => {
      const state: IGraphState = {
        messages: [
          new AIMessage(`
            <tool_call> {"name":"get_weather","arguments":{"city":"Warszawa"}} </tool_call>
            <tool_call> {"name":"calculator","arguments":{"expression":"2+2"}} </tool_call>
          `),
        ],
        locale: 'en',
        currentAgent: 'chat',
        response: '',
        lastSearchResults: null,
      };

      const result = shouldContinue(state);

      expect(result).toBe('tools');
    });

    it('should return "end" when last message has no tool calls', () => {
      const state: IGraphState = {
        messages: [
          new AIMessage('Hello, how can I help you today?'),
        ],
        locale: 'en',
        currentAgent: 'chat',
        response: '',
        lastSearchResults: null,
      };

      const result = shouldContinue(state);

      expect(result).toBe('end');
    });

    it('should return "end" when messages array is empty', () => {
      const state: IGraphState = {
        messages: [],
        locale: 'en',
        currentAgent: 'chat',
        response: '',
        lastSearchResults: null,
      };

      const result = shouldContinue(state);

      expect(result).toBe('end');
    });

    it('should check only the last message', () => {
      const state: IGraphState = {
        messages: [
          new AIMessage('<tool_call> {"name":"get_weather","arguments":{"city":"Warszawa"}} </tool_call>'),
          new AIMessage('The weather in Warsaw is sunny.'),
        ],
        locale: 'en',
        currentAgent: 'chat',
        response: '',
        lastSearchResults: null,
      };

      const result = shouldContinue(state);

      expect(result).toBe('end');
    });

    it('should handle HumanMessage as last message', () => {
      const state: IGraphState = {
        messages: [
          new HumanMessage('What is the weather?'),
        ],
        locale: 'en',
        currentAgent: 'chat',
        response: '',
        lastSearchResults: null,
      };

      const result = shouldContinue(state);

      expect(result).toBe('end');
    });

    it('should return "end" when tool call JSON is invalid', () => {
      const state: IGraphState = {
        messages: [
          new AIMessage('<tool_call> {invalid} </tool_call>'),
        ],
        locale: 'en',
        currentAgent: 'chat',
        response: '',
        lastSearchResults: null,
      };

      const result = shouldContinue(state);

      expect(result).toBe('end');
    });

    it('should return "end" when tool call is missing required fields', () => {
      const state: IGraphState = {
        messages: [
          new AIMessage('<tool_call> {"name":"test"} </tool_call>'),
        ],
        locale: 'en',
        currentAgent: 'chat',
        response: '',
        lastSearchResults: null,
      };

      const result = shouldContinue(state);

      expect(result).toBe('end');
    });
  });
});
