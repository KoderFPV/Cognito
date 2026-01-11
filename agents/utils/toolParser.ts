import { graphLogger } from '@/services/logger/graphLogger';
import { chatTools } from '@/agents/tools/testTools';

export interface IToolCall {
  name: string;
  arguments: Record<string, unknown>;
}

export const parseToolCalls = (content: string): IToolCall[] => {
  const toolCallRegex = /<tool_call>\s*(\{[\s\S]*?\})\s*<\/tool_call>/g;
  const toolCalls: IToolCall[] = [];
  let match;

  while ((match = toolCallRegex.exec(content)) !== null) {
    try {
      const parsed = JSON.parse(match[1]);
      if (parsed.name && parsed.arguments) {
        toolCalls.push(parsed);
      }
    } catch {
      graphLogger.warn('tools', `Failed to parse tool call: ${match[1]}`);
    }
  }

  return toolCalls;
};

export const executeToolCall = async (toolCall: IToolCall): Promise<string> => {
  const tool = chatTools.find((t) => t.name === toolCall.name);

  if (!tool) {
    return `Błąd: Nieznane narzędzie "${toolCall.name}"`;
  }

  try {
    const result = await tool.invoke(JSON.stringify(toolCall.arguments));
    graphLogger.info('tools', `Executed ${toolCall.name}, result: ${result}`);
    return String(result);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    graphLogger.error('tools', `Tool ${toolCall.name} failed: ${errorMsg}`);
    return `Błąd wykonania narzędzia: ${errorMsg}`;
  }
};
