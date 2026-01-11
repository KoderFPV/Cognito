import { StateGraph, END, START, Annotation } from '@langchain/langgraph';
import { HumanMessage, AIMessage, SystemMessage, BaseMessage } from '@langchain/core/messages';
import { createBielikClient } from '@/services/llm/llm.service';
import { createRouterSystemPrompt } from '@/services/agents/router/routerPrompts';
import { graphLogger } from '@/services/logger/graphLogger';
import { IStreamCallback } from '@/services/agents/state/agentState';
import { chatTools } from '@/services/agents/tools/testTools';

interface IToolCall {
  name: string;
  arguments: Record<string, unknown>;
}

const parseToolCalls = (content: string): IToolCall[] => {
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

const executeToolCall = async (toolCall: IToolCall): Promise<string> => {
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

const ROUTER_TEMPERATURE = 0.1;
const ROUTER_MAX_TOKENS = 50;
const CHAT_TEMPERATURE = 0.7;
const CHAT_MAX_TOKENS = 500;
const MAX_CONTEXT_MESSAGES = 10;

const GraphState = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (current, update) => [...current, ...update],
  }),
  locale: Annotation<string>(),
  currentAgent: Annotation<string>(),
  response: Annotation<string>(),
});

const createChatSystemPrompt = (locale: string) => {
  const prompts: Record<string, string> = {
    en: `You are a helpful AI shopping assistant for Cognito e-commerce platform.

You have access to tools. When user asks about weather or calculations, IMMEDIATELY use the appropriate tool by responding with:
<tool_call> {"name":"tool_name","arguments":{"arg":"value"}} </tool_call>

Available tools:
- get_weather: {"name":"get_weather","arguments":{"city":"city name"}} - Check weather in Polish cities
- calculator: {"name":"calculator","arguments":{"expression":"2+2"}} - Math calculations

IMPORTANT: When a tool is needed, respond ONLY with the tool_call tag, nothing else.
For normal conversation, respond normally without tool_call tags.`,
    pl: `Jesteś pomocnym asystentem AI dla platformy e-commerce Cognito.

Masz dostęp do narzędzi. Gdy użytkownik pyta o pogodę lub obliczenia, NATYCHMIAST użyj odpowiedniego narzędzia odpowiadając:
<tool_call> {"name":"nazwa_narzedzia","arguments":{"arg":"wartosc"}} </tool_call>

Dostępne narzędzia:
- get_weather: {"name":"get_weather","arguments":{"city":"nazwa miasta"}} - Sprawdza pogodę w polskich miastach
- calculator: {"name":"calculator","arguments":{"expression":"2+2"}} - Obliczenia matematyczne

WAŻNE: Gdy potrzebne jest narzędzie, odpowiedz TYLKO tagiem tool_call, nic więcej.
Dla normalnej rozmowy odpowiadaj normalnie bez tagów tool_call.`,
  };
  return prompts[locale] || prompts.en;
};

const isHumanMessage = (msg: BaseMessage): boolean => {
  if (typeof msg._getType === 'function') {
    return msg._getType() === 'human';
  }
  const anyMsg = msg as { role?: string };
  return anyMsg.role === 'human' || anyMsg.role === 'user';
};

const normalizeMessages = (messages: BaseMessage[]): BaseMessage[] => {
  return messages.map((msg) => {
    if (msg instanceof HumanMessage || msg instanceof AIMessage || msg instanceof SystemMessage) {
      return msg;
    }
    const anyMsg = msg as { role?: string; content?: string };
    if (anyMsg.role === 'human' || anyMsg.role === 'user') {
      return new HumanMessage(anyMsg.content || '');
    }
    if (anyMsg.role === 'assistant' || anyMsg.role === 'ai') {
      return new AIMessage(anyMsg.content || '');
    }
    return new HumanMessage(String(msg));
  });
};

const routerNode = async (state: typeof GraphState.State) => {
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
  const messages: BaseMessage[] = [new SystemMessage(systemPrompt), ...normalizedMessages];
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

const chatNode = async (state: typeof GraphState.State) => {
  const llm = createBielikClient(CHAT_TEMPERATURE, CHAT_MAX_TOKENS);
  const locale = state.locale || 'en';
  const systemPrompt = createChatSystemPrompt(locale);

  const normalizedMessages = normalizeMessages(state.messages);
  const messages: BaseMessage[] = [new SystemMessage(systemPrompt), ...normalizedMessages];
  const response = await llm.invoke(messages);
  const content = response.content.toString();

  const toolCalls = parseToolCalls(content);
  graphLogger.info('chat', `Response received, parsed tool calls: ${toolCalls.length}`);

  return { messages: [new AIMessage(content)] };
};

const toolExecutionNode = async (state: typeof GraphState.State) => {
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

const shouldContinue = (state: typeof GraphState.State) => {
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

const finalResponseNode = async (state: typeof GraphState.State) => {
  const lastMessage = state.messages[state.messages.length - 1];
  const content = lastMessage?.content?.toString() || '';
  return { response: content };
};

const productsNode = async (state: typeof GraphState.State) => {
  const locale = state.locale || 'en';
  const fallbackMessage =
    locale === 'pl'
      ? 'Funkcja wyszukiwania produktów jest obecnie w trakcie implementacji. Proszę spróbować później.'
      : 'Product search functionality is currently under implementation. Please try again later.';

  graphLogger.info('products', 'Returning fallback message');

  return { messages: [new AIMessage(fallbackMessage)], response: fallbackMessage };
};

const routeAfterRouter = (state: typeof GraphState.State) => {
  const agent = state.currentAgent;
  if (agent === 'products' || agent === 'product') {
    return 'products';
  }
  return 'chat';
};

const workflow = new StateGraph(GraphState)
  .addNode('router', routerNode)
  .addNode('chat', chatNode)
  .addNode('tools', toolExecutionNode)
  .addNode('final', finalResponseNode)
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

  try {
    const finalState = await chatGraph.invoke(initialState);
    const response = finalState.response || '';

    callbacks.onToken(response);
    graphLogger.info('graph', `Completed, response length=${response.length}`);

    return response;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Graph execution failed';
    callbacks.onError(new Error(errorMessage));
    throw error;
  }
};
