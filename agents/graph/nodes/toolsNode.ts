import { HumanMessage } from '@langchain/core/messages';
import { graphLogger } from '@/services/logger/graphLogger';
import { IGraphState } from '@/agents/graph/state';
import { parseToolCalls, executeToolCall } from '@/agents/utils/toolParser';

export const toolsNode = async (state: IGraphState) => {
  const lastMessage = state.messages[state.messages.length - 1];
  const content = lastMessage?.content?.toString() || '';
  const toolCalls = parseToolCalls(content);

  const results: string[] = [];
  for (const toolCall of toolCalls) {
    const result = await executeToolCall(toolCall);
    results.push(`[${toolCall.name}]: ${result}`);
  }

  const toolResultMessage = new HumanMessage(
    `Wyniki narzędzi:\n${results.join('\n')}\n\nNa podstawie powyższych wyników, odpowiedz użytkownikowi.`
  );

  graphLogger.info('tools', `Executed ${toolCalls.length} tools, returning results to LLM`);

  return { messages: [toolResultMessage] };
};
