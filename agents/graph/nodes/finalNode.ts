import { IGraphState } from '@/agents/graph/state';

export const finalNode = async (state: IGraphState) => {
  const lastMessage = state.messages[state.messages.length - 1];
  const content = lastMessage?.content?.toString() || '';
  return { response: content };
};
