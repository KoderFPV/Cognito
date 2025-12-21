import { HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages';
import { createQwen3Client } from '@/services/llm/llm.service';
import { IAgentState, IStreamCallback } from '@/services/agents/state/agentState';

const CHAT_TEMPERATURE = 0.7;
const CHAT_MAX_TOKENS = 500;

const createChatSystemPrompt = (locale: string) => {
  const prompts: Record<string, string> = {
    en: `You are a helpful and friendly AI shopping assistant for an e-commerce platform called Cognito.
You can help with general questions, provide information about shopping, and have pleasant conversations.
If users ask about specific products, politely let them know they should ask about products more specifically.
Be concise and helpful in your responses.`,

    pl: `Jesteś pomocnym i przyjaznym asystentem AI dla platformy e-commerce o nazwie Cognito.
Możesz pomóc w ogólnych pytaniach, dostarczyć informacji o zakupach i prowadzić przyjemne rozmowy.
Jeśli użytkownicy pytają o konkretne produkty, grzecznie poinformuj ich, że powinni zapytać o produkty bardziej konkretnie.
Bądź zwięzły i pomocny w swoich odpowiedziach.`,
  };

  return prompts[locale] || prompts.en;
};

export const processChatMessage = async (
  state: IAgentState,
  callbacks: IStreamCallback
): Promise<string> => {
  const llm = createQwen3Client(CHAT_TEMPERATURE, CHAT_MAX_TOKENS);
  const systemPrompt = createChatSystemPrompt(state.locale);

  const messages = [new SystemMessage(systemPrompt)];

  for (const msg of state.messages) {
    if (msg.role === 'user') {
      messages.push(new HumanMessage(msg.content));
    } else if (msg.role === 'assistant') {
      messages.push(new AIMessage(msg.content));
    }
  }

  try {
    const stream = await llm.stream(messages);
    let fullResponse = '';

    for await (const chunk of stream) {
      const content = chunk.content.toString();
      fullResponse += content;
      callbacks.onToken(content);
    }

    return fullResponse;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Chat processing failed';
    callbacks.onError(new Error(errorMessage));
    throw error;
  }
};
