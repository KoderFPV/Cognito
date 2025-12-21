export interface IAgentMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface IAgentState {
  messages: IAgentMessage[];
  sessionId: string;
  userId?: string;
  locale: string;
  currentAgent: string;
  toolResults?: Record<string, unknown>;
}

export type AgentType = 'router' | 'chat' | 'product' | 'products' | 'registration' | 'cart' | 'checkout' | 'info';
