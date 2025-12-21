export interface IMessage {
  _id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface IConversation {
  _id: string;
  sessionId: string;
  userId?: string;
  locale: string;
  messages: IMessage[];
  createdAt: Date;
  updatedAt: Date;
  deleted: boolean;
}
