export interface IChatStreamRequest {
  message: string;
  sessionId?: string;
}

export interface IChatStreamCallbacks {
  onToken: (token: string) => void;
  onComplete: (messageId: string, sessionId: string) => void;
  onError: (error: Error) => void;
}

export const streamChatMessage = async (
  data: IChatStreamRequest,
  locale: string,
  callbacks: IChatStreamCallbacks
): Promise<void> => {
  const response = await fetch(`/${locale}/api/chat/send`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to send message' }));
    throw new Error(errorData.message || 'Failed to send message');
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  if (!reader) {
    throw new Error('Response body is null');
  }

  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('event: message')) {
          const dataLine = line.split('\n')[1];
          if (dataLine?.startsWith('data: ')) {
            const data = JSON.parse(dataLine.slice(6));

            if (data.type === 'token') {
              callbacks.onToken(data.content);
            } else if (data.type === 'complete') {
              callbacks.onComplete(data.messageId, data.sessionId);
            }
          }
        } else if (line.startsWith('event: error')) {
          const dataLine = line.split('\n')[1];
          if (dataLine?.startsWith('data: ')) {
            const data = JSON.parse(dataLine.slice(6));
            callbacks.onError(new Error(data.message));
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
};
