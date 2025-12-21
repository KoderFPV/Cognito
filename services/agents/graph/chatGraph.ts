import { StateGraph, END } from '@langchain/langgraph';
import { IAgentState, IStreamCallback } from '@/services/agents/state/agentState';
import { routeMessage } from '@/services/agents/router/routerAgent';
import { processChatMessage } from '@/services/agents/specialized/chatAgent';

export const executeChatGraph = async (
  initialState: IAgentState,
  callbacks: IStreamCallback
): Promise<string> => {
  const routedAgent = await routeMessage(initialState);

  const updatedState: IAgentState = {
    ...initialState,
    currentAgent: routedAgent,
  };

  if (routedAgent === 'chat') {
    return await processChatMessage(updatedState, callbacks);
  }

  if (routedAgent === 'products' || routedAgent === 'product') {
    const fallbackMessage =
      updatedState.locale === 'pl'
        ? 'Funkcja wyszukiwania produktów jest obecnie w trakcie implementacji. Proszę spróbować później.'
        : 'Product search functionality is currently under implementation. Please try again later.';

    callbacks.onToken(fallbackMessage);
    return fallbackMessage;
  }

  return await processChatMessage(updatedState, callbacks);
};
