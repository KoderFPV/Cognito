import { SystemMessage, AIMessage } from '@langchain/core/messages';
import { createOllamaClient } from '@/services/llm/llm.service';
import { createChatSystemPrompt } from '@/agents/prompts/chatPrompts';
import { graphLogger } from '@/services/logger/graphLogger';
import { IGraphState } from '@/agents/graph/state';
import { normalizeMessages } from '@/agents/utils/messageUtils';
import { parseToolCalls } from '@/agents/utils/toolParser';

const CHAT_TEMPERATURE = 0.7;
const CHAT_MAX_TOKENS = 500;

export const chatNode = async (state: IGraphState) => {
  const llm = createOllamaClient(CHAT_TEMPERATURE, CHAT_MAX_TOKENS);
  const locale = state.locale || 'en';
  const systemPrompt = createChatSystemPrompt(locale);

  const normalizedMessages = normalizeMessages(state.messages);
  const messages = [new SystemMessage(systemPrompt), ...normalizedMessages];
  const response = await llm.invoke(messages);
  const content = response.content.toString();

  const toolCalls = parseToolCalls(content);
  graphLogger.info('chat', `Response received, parsed tool calls: ${toolCalls.length}`);

  return { messages: [new AIMessage(content)] };
};
