import { StateGraph, END, START } from '@langchain/langgraph';
import { HumanMessage, AIMessage, BaseMessage } from '@langchain/core/messages';
import { graphLogger } from '@/services/logger/graphLogger';
import { GraphState, ISearchResult } from '@/agents/graph/state';
import { routerNode } from '@/agents/graph/nodes/routerNode';
import { chatNode } from '@/agents/graph/nodes/chatNode';
import { toolsNode } from '@/agents/graph/nodes/toolsNode';
import { productsNode } from '@/agents/graph/nodes/productsNode';
import { productNode } from '@/agents/graph/nodes/productNode';
import { finalNode } from '@/agents/graph/nodes/finalNode';
import { routeAfterRouter, shouldContinue } from '@/agents/graph/edges';

export interface IStreamCallback {
  onToken: (token: string) => void;
  onComplete: (messageId: string, sessionId: string) => void;
  onError: (error: Error) => void;
}

export interface IChatGraphResult {
  response: string;
  lastSearchResults: ISearchResult | null;
}

const workflow = new StateGraph(GraphState)
  .addNode('router', routerNode)
  .addNode('chat', chatNode)
  .addNode('tools', toolsNode)
  .addNode('final', finalNode)
  .addNode('products', productsNode)
  .addNode('product', productNode)
  .addEdge(START, 'router')
  .addConditionalEdges('router', routeAfterRouter, ['chat', 'products', 'product'])
  .addConditionalEdges('chat', shouldContinue, { tools: 'tools', end: 'final' })
  .addEdge('tools', 'chat')
  .addEdge('final', END)
  .addEdge('products', END)
  .addEdge('product', END);

export const chatGraph = workflow.compile();

export const executeChatGraphWithStream = async (
  sessionId: string,
  locale: string,
  messages: Array<{ role: string; content: string }>,
  callbacks: IStreamCallback,
  previousSearchResults?: ISearchResult | null
): Promise<IChatGraphResult> => {
  graphLogger.info('graph', `Started session=${sessionId.slice(0, 8)}`);

  const baseMessages: BaseMessage[] = messages.map((msg) => {
    if (msg.role === 'user') {
      return new HumanMessage(msg.content);
    }
    return new AIMessage(msg.content);
  });

  const initialState = {
    messages: baseMessages,
    locale,
    currentAgent: '',
    response: '',
    lastSearchResults: previousSearchResults || null,
  };

  try {
    const finalState = await chatGraph.invoke(initialState);
    const response = finalState.response || '';

    callbacks.onToken(response);
    graphLogger.info('graph', `Completed, response length=${response.length}`);

    return {
      response,
      lastSearchResults: finalState.lastSearchResults || null,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Graph execution failed';
    callbacks.onError(new Error(errorMessage));
    throw error;
  }
};
