import { SystemMessage } from '@langchain/core/messages';
import { createBielikClient } from '@/services/llm/llm.service';
import { createRouterSystemPrompt } from '@/agents/prompts/routerPrompts';
import { graphLogger } from '@/services/logger/graphLogger';
import { IGraphState } from '@/agents/graph/state';
import { isHumanMessage, normalizeMessages } from '@/agents/utils/messageUtils';

const ROUTER_TEMPERATURE = 0.1;
const ROUTER_MAX_TOKENS = 50;
const MAX_CONTEXT_MESSAGES = 10;

export const routerNode = async (state: IGraphState) => {
  const llm = createBielikClient(ROUTER_TEMPERATURE, ROUTER_MAX_TOKENS);
  const locale = state.locale || 'en';
  const systemPrompt = createRouterSystemPrompt(locale);

  const recentMessages = state.messages.slice(-MAX_CONTEXT_MESSAGES);
  const lastMessage = recentMessages[recentMessages.length - 1];

  if (!lastMessage || !isHumanMessage(lastMessage)) {
    graphLogger.info('router', 'No user message, defaulting to chat');
    return { currentAgent: 'chat' };
  }

  const normalizedMessages = normalizeMessages(recentMessages);
  const messages = [new SystemMessage(systemPrompt), ...normalizedMessages];
  const response = await llm.invoke(messages);
  const rawResponse = response.content.toString();

  const routedAgent = rawResponse.toLowerCase().trim();

  graphLogger.info('router', `Decision: ${routedAgent}`);

  const validAgents = ['chat', 'products', 'product'];
  if (validAgents.includes(routedAgent)) {
    return { currentAgent: routedAgent };
  }

  return { currentAgent: 'chat' };
};
