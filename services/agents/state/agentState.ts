import { IAgentMessage, IAgentState, AgentType } from '@/domain/agent';

export { IAgentMessage, IAgentState, AgentType };

export interface IStreamCallback {
  onToken: (token: string) => void;
  onComplete: (messageId: string, sessionId: string) => void;
  onError: (error: Error) => void;
}

export const createInitialState = (
  sessionId: string,
  locale: string,
  userMessage: string,
  userId?: string
): IAgentState => {
  return {
    messages: [
      {
        role: 'user',
        content: userMessage,
      },
    ],
    sessionId,
    userId,
    locale,
    currentAgent: 'router',
  };
};
