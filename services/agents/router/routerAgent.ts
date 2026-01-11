import { HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages';
import { createBielikClient } from '@/services/llm/llm.service';
import { IAgentState, IAgentMessage, AgentType } from '@/services/agents/state/agentState';
import { createRouterSystemPrompt } from './routerPrompts';

const ROUTER_TEMPERATURE = 0.1;
const ROUTER_MAX_TOKENS = 50;
const MAX_CONTEXT_MESSAGES = 10;

const getRecentMessages = (messages: IAgentMessage[]): IAgentMessage[] => {
  return messages.slice(-MAX_CONTEXT_MESSAGES);
};

export const routeMessage = async (state: IAgentState): Promise<AgentType> => {
  const llm = createBielikClient(ROUTER_TEMPERATURE, ROUTER_MAX_TOKENS);
  const systemPrompt = createRouterSystemPrompt(state.locale);

  const lastMessage = state.messages[state.messages.length - 1];

  if (!lastMessage || lastMessage.role !== 'user') {
    return 'chat';
  }

  const recentMessages = getRecentMessages(state.messages);

  const messages: (SystemMessage | HumanMessage | AIMessage)[] = [
    new SystemMessage(systemPrompt),
  ];

  for (const msg of recentMessages) {
    if (msg.role === 'user') {
      messages.push(new HumanMessage(msg.content));
    } else if (msg.role === 'assistant') {
      messages.push(new AIMessage(msg.content));
    }
  }

  const response = await llm.invoke(messages);
  const rawContent = response.content.toString();
  const routedAgent = rawContent.toLowerCase().trim();

  const validAgents: AgentType[] = ['chat', 'products', 'product'];

  if (validAgents.includes(routedAgent as AgentType)) {
    return routedAgent as AgentType;
  }

  return 'chat';
};
