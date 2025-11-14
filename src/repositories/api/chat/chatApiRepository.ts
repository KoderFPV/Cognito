export interface IChatApiRequest {
  message: string;
}

export interface IChatApiResponse {
  message: string;
  messageId: string;
}

export const sendMessageToChat = async (
  data: IChatApiRequest
): Promise<IChatApiResponse> => {
  const response = await fetch('/api/chat/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to send message');
  }

  return response.json();
};
