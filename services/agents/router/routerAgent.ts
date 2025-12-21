import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { createQwen3Client } from '@/services/llm/llm.service';
import { IAgentState, AgentType } from '@/services/agents/state/agentState';
import { createRouterSystemPrompt } from './routerPrompts';

const ROUTER_TEMPERATURE = 0.1;
const ROUTER_MAX_TOKENS = 50;

export const routeMessage = async (state: IAgentState): Promise<AgentType> => {
  const llm = createQwen3Client(ROUTER_TEMPERATURE, ROUTER_MAX_TOKENS);
  const systemPrompt = createRouterSystemPrompt(state.locale);

  const lastMessage = state.messages[state.messages.length - 1];

  if (!lastMessage || lastMessage.role !== 'user') {
    return 'chat';
  }

  const messages = [
    new SystemMessage(systemPrompt),
    new HumanMessage(lastMessage.content),
  ];

  const response = await llm.invoke(messages);
  const routedAgent = response.content.toString().toLowerCase().trim();

  const validAgents: AgentType[] = ['chat', 'products', 'product'];

  if (validAgents.includes(routedAgent as AgentType)) {
    return routedAgent as AgentType;
  }

  return 'chat';
};
