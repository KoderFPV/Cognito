import { HumanMessage, AIMessage, SystemMessage, BaseMessage } from '@langchain/core/messages';

export const isHumanMessage = (msg: BaseMessage): boolean => {
  if (typeof msg._getType === 'function') {
    return msg._getType() === 'human';
  }
  const anyMsg = msg as { role?: string };
  return anyMsg.role === 'human' || anyMsg.role === 'user';
};

export const normalizeMessages = (messages: BaseMessage[]): BaseMessage[] => {
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
