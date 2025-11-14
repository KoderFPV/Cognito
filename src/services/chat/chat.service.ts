export interface IChatServiceResponse {
  message: string;
  messageId: string;
}

export const sendChatMessage = async (
  message: string
): Promise<IChatServiceResponse> => {
  // TODO: Implement integration with LangGraph API
  // This will send the user message to the AI agent
  // and return the assistant's response
  throw new Error('Chat service not yet implemented');
};
