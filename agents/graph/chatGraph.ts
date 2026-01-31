import { StateGraph, END, START } from '@langchain/langgraph';
import { HumanMessage, AIMessage, BaseMessage } from '@langchain/core/messages';
import { graphLogger } from '@/services/logger/graphLogger';
import { GraphState } from '@/agents/graph/state';
import { routerNode } from '@/agents/graph/nodes/routerNode';
import { chatNode } from '@/agents/graph/nodes/chatNode';
import { toolsNode } from '@/agents/graph/nodes/toolsNode';
import { productsNode } from '@/agents/graph/nodes/productsNode';
import { finalNode } from '@/agents/graph/nodes/finalNode';
import { routeAfterRouter, shouldContinue } from '@/agents/graph/edges';

export interface IStreamCallback {
  onToken: (token: string) => void;
  onComplete: (messageId: string, sessionId: string) => void;
  onError: (error: Error) => void;
}

const workflow = new StateGraph(GraphState)
  .addNode('router', routerNode)
  .addNode('chat', chatNode)
  .addNode('tools', toolsNode)
  .addNode('final', finalNode)
  .addNode('products', productsNode)
  .addEdge(START, 'router')
  .addConditionalEdges('router', routeAfterRouter, ['chat', 'products'])
  .addConditionalEdges('chat', shouldContinue, { tools: 'tools', end: 'final' })
  .addEdge('tools', 'chat')
  .addEdge('final', END)
  .addEdge('products', END);

export const chatGraph = workflow.compile();

export const executeChatGraphWithStream = async (
  sessionId: string,
  locale: string,
  messages: Array<{ role: string; content: string }>,
  callbacks: IStreamCallback
): Promise<string> => {
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
  };

  let fullResponse = '';

  try {
    const eventStream = chatGraph.streamEvents(initialState, {
      version: 'v2',
    });

    for await (const event of eventStream) {
      if (event.event === 'on_chat_model_stream') {
        const nodeName = event.metadata?.langgraph_node;
        if (nodeName !== 'chat') {
          continue;
        }
        const chunk = event.data?.chunk;
        if (chunk?.content) {
          const token = typeof chunk.content === 'string' ? chunk.content : '';
          if (token) {
            fullResponse += token;
            callbacks.onToken(token);
          }
        }
      }
    }

    graphLogger.info('graph', `Completed, response length=${fullResponse.length}`);

    return fullResponse;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Graph execution failed';
    callbacks.onError(new Error(errorMessage));
    throw error;
  }
};
