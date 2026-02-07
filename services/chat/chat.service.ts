import { ObjectId } from 'mongodb';
import { getTranslations } from 'next-intl/server';
import { IStreamCallback, executeChatGraphWithStream } from '@/agents/graph/chatGraph';
import {
  createConversation,
  getConversationBySessionId,
  addMessageToConversation,
  getConversationHistory,
} from '@/models/conversations/conversationsModel';

const CONVERSATION_HISTORY_LIMIT = 20;

export const streamChatResponse = async (
  message: string,
  locale: string,
  sessionId: string | undefined,
  callbacks: IStreamCallback,
  userId?: string
): Promise<string> => {
  const t = await getTranslations({ locale, namespace: 'chat.errors' });

  try {
    let currentSessionId = sessionId;
    let conversation = sessionId
      ? await getConversationBySessionId(sessionId)
      : null;

    if (!conversation) {
      currentSessionId = crypto.randomUUID();
      conversation = await createConversation(currentSessionId, locale, userId);
    }

    await addMessageToConversation(currentSessionId!, {
      role: 'user',
      content: message,
      timestamp: new Date(),
    });

    const history = await getConversationHistory(
      currentSessionId!,
      CONVERSATION_HISTORY_LIMIT
    );

    const agentMessages = history.map((msg) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    }));

    const result = await executeChatGraphWithStream(
      currentSessionId!,
      locale,
      agentMessages,
      {
        onToken: callbacks.onToken,
        onError: callbacks.onError,
        onComplete: callbacks.onComplete,
      }
    );

    const messageId = new ObjectId().toString();

    await addMessageToConversation(currentSessionId!, {
      role: 'assistant',
      content: result.response,
      timestamp: new Date(),
    });

    callbacks.onComplete(messageId, currentSessionId!);

    return result.response;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : t('processingFailed');
    callbacks.onError(new Error(errorMessage));
    throw error;
  }
};
