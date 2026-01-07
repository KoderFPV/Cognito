import { useState } from 'react';
import { useParams } from 'next/navigation';
import { IChatMessage } from '@/template/components/Chat/ChatWindowTemplate';
import { streamChatMessage } from '@/repositories/api/chat/chatApiRepository';

const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
};

export const useChatWindow = () => {
  const params = useParams();
  const locale = params.locale as string;

  const [messages, setMessages] = useState<IChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);

  const addMessage = (content: string, sender: 'user' | 'assistant') => {
    const newMessage: IChatMessage = {
      id: generateId(),
      content,
      sender,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) {
      return;
    }

    const userMessage = inputValue;
    addMessage(userMessage, 'user');
    setInputValue('');
    setIsLoading(true);
    setError(null);

    const assistantMessageId = generateId();
    let assistantContent = '';

    const assistantMessage: IChatMessage = {
      id: assistantMessageId,
      content: '',
      sender: 'assistant',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, assistantMessage]);

    streamChatMessage(
      { message: userMessage, sessionId },
      locale,
      {
        onToken: (token: string) => {
          assistantContent += token;
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? { ...msg, content: assistantContent }
                : msg
            )
          );
        },
        onComplete: (messageId: string, newSessionId: string) => {
          setSessionId(newSessionId);
          setIsLoading(false);
        },
        onError: (err: Error) => {
          setError(err.message);
          setIsLoading(false);
        },
      }
    ).catch((err) => {
      setError(err.message);
      setIsLoading(false);
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return {
    messages,
    inputValue,
    isLoading,
    error,
    setInputValue,
    setError,
    setIsLoading,
    addMessage,
    handleSendMessage,
    handleKeyDown,
  };
};
