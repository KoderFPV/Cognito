import { useState } from 'react';
import { IChatMessage } from '@/template/components/Chat/ChatWindowTemplate';

export const useChatWindow = () => {
  const [messages, setMessages] = useState<IChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addMessage = (content: string, sender: 'user' | 'assistant') => {
    const newMessage: IChatMessage = {
      id: crypto.randomUUID(),
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

    addMessage(inputValue, 'user');
    setInputValue('');
    setIsLoading(true);
    setError(null);

    // TODO: Integration with chat API will go here
    // For now, simulate sending by clearing loading state after a delay
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
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
