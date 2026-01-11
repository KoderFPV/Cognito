import { describe, it, expect, vi, beforeEach } from 'vitest';
import { parseToolCalls, executeToolCall, IToolCall } from './toolParser';

vi.mock('@/services/logger/graphLogger', () => ({
  graphLogger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/agents/tools/testTools', () => ({
  chatTools: [
    {
      name: 'get_weather',
      invoke: vi.fn().mockResolvedValue('Słonecznie, 22°C'),
    },
    {
      name: 'calculator',
      invoke: vi.fn().mockResolvedValue('Wynik: 4'),
    },
  ],
}));

describe('toolParser', () => {
  describe('parseToolCalls', () => {
    it('should parse single tool call', () => {
      const content = '<tool_call> {"name":"get_weather","arguments":{"city":"Warszawa"}} </tool_call>';

      const result = parseToolCalls(content);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        name: 'get_weather',
        arguments: { city: 'Warszawa' },
      });
    });

    it('should parse multiple tool calls', () => {
      const content = `
        <tool_call> {"name":"get_weather","arguments":{"city":"Warszawa"}} </tool_call>
        <tool_call> {"name":"calculator","arguments":{"expression":"2+2"}} </tool_call>
      `;

      const result = parseToolCalls(content);

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('get_weather');
      expect(result[1].name).toBe('calculator');
    });

    it('should return empty array when no tool calls found', () => {
      const content = 'This is a regular message without tool calls';

      const result = parseToolCalls(content);

      expect(result).toHaveLength(0);
    });

    it('should return empty array for empty string', () => {
      const result = parseToolCalls('');

      expect(result).toHaveLength(0);
    });

    it('should skip invalid JSON in tool call', () => {
      const content = '<tool_call> {invalid json} </tool_call>';

      const result = parseToolCalls(content);

      expect(result).toHaveLength(0);
    });

    it('should skip tool call without name property', () => {
      const content = '<tool_call> {"arguments":{"city":"Warszawa"}} </tool_call>';

      const result = parseToolCalls(content);

      expect(result).toHaveLength(0);
    });

    it('should skip tool call without arguments property', () => {
      const content = '<tool_call> {"name":"get_weather"} </tool_call>';

      const result = parseToolCalls(content);

      expect(result).toHaveLength(0);
    });

    it('should parse tool call with multiline JSON', () => {
      const content = `<tool_call> {
        "name": "get_weather",
        "arguments": {
          "city": "Kraków"
        }
      } </tool_call>`;

      const result = parseToolCalls(content);

      expect(result).toHaveLength(1);
      expect(result[0].arguments).toEqual({ city: 'Kraków' });
    });

    it('should parse tool call without spaces around JSON', () => {
      const content = '<tool_call>{"name":"calculator","arguments":{"expression":"5*5"}}</tool_call>';

      const result = parseToolCalls(content);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('calculator');
    });

    it('should parse valid tool calls and skip invalid ones', () => {
      const content = `
        <tool_call> {"name":"get_weather","arguments":{"city":"Gdańsk"}} </tool_call>
        <tool_call> {broken} </tool_call>
        <tool_call> {"name":"calculator","arguments":{"expression":"10/2"}} </tool_call>
      `;

      const result = parseToolCalls(content);

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('get_weather');
      expect(result[1].name).toBe('calculator');
    });

    it('should handle tool call with complex arguments', () => {
      const content = '<tool_call> {"name":"search","arguments":{"query":"test","filters":{"price":100,"category":"electronics"}}} </tool_call>';

      const result = parseToolCalls(content);

      expect(result).toHaveLength(1);
      expect(result[0].arguments).toEqual({
        query: 'test',
        filters: { price: 100, category: 'electronics' },
      });
    });
  });

  describe('executeToolCall', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should execute known tool and return result', async () => {
      const toolCall: IToolCall = {
        name: 'get_weather',
        arguments: { city: 'Warszawa' },
      };

      const result = await executeToolCall(toolCall);

      expect(result).toBe('Słonecznie, 22°C');
    });

    it('should execute calculator tool', async () => {
      const toolCall: IToolCall = {
        name: 'calculator',
        arguments: { expression: '2+2' },
      };

      const result = await executeToolCall(toolCall);

      expect(result).toBe('Wynik: 4');
    });

    it('should return error message for unknown tool', async () => {
      const toolCall: IToolCall = {
        name: 'unknown_tool',
        arguments: {},
      };

      const result = await executeToolCall(toolCall);

      expect(result).toBe('Błąd: Nieznane narzędzie "unknown_tool"');
    });

    it('should handle tool execution error', async () => {
      const { chatTools } = await import('@/agents/tools/testTools');
      const mockTool = chatTools.find((t) => t.name === 'get_weather');
      vi.mocked(mockTool!.invoke).mockRejectedValueOnce(new Error('Network error'));

      const toolCall: IToolCall = {
        name: 'get_weather',
        arguments: { city: 'Warszawa' },
      };

      const result = await executeToolCall(toolCall);

      expect(result).toBe('Błąd wykonania narzędzia: Network error');
    });

    it('should handle non-Error exception', async () => {
      const { chatTools } = await import('@/agents/tools/testTools');
      const mockTool = chatTools.find((t) => t.name === 'calculator');
      vi.mocked(mockTool!.invoke).mockRejectedValueOnce('String error');

      const toolCall: IToolCall = {
        name: 'calculator',
        arguments: { expression: 'invalid' },
      };

      const result = await executeToolCall(toolCall);

      expect(result).toBe('Błąd wykonania narzędzia: Unknown error');
    });

    it('should pass arguments as JSON string to tool', async () => {
      const { chatTools } = await import('@/agents/tools/testTools');
      const mockTool = chatTools.find((t) => t.name === 'get_weather');

      const toolCall: IToolCall = {
        name: 'get_weather',
        arguments: { city: 'Poznań' },
      };

      await executeToolCall(toolCall);

      expect(mockTool!.invoke).toHaveBeenCalledWith('{"city":"Poznań"}');
    });
  });
});
