import { graphLogger } from '@/services/logger/graphLogger';
import { IGraphState } from '@/agents/graph/state';
import { parseToolCalls } from '@/agents/utils/toolParser';

export const routeAfterRouter = (state: IGraphState) => {
  const agent = state.currentAgent;
  if (agent === 'products' || agent === 'product') {
    return 'products';
  }
  return 'chat';
};

export const shouldContinue = (state: IGraphState) => {
  const lastMessage = state.messages[state.messages.length - 1];
  const content = lastMessage?.content?.toString() || '';

  const toolCalls = parseToolCalls(content);
  if (toolCalls.length > 0) {
    graphLogger.info('tools', `Found ${toolCalls.length} tool calls, routing to tools`);
    return 'tools';
  }

  graphLogger.info('chat', `Final response length: ${content.length}`);
  return 'end';
};
