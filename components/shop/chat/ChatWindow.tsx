'use client';

import { useTranslations } from 'next-intl';
import { ChatWindowTemplate } from '@/template/components/Chat/ChatWindowTemplate';
import { useChatWindow } from './useChatWindow';

export const ChatWindow = () => {
  const t = useTranslations('chat');
  const {
    messages,
    inputValue,
    isLoading,
    error,
    setInputValue,
    handleSendMessage,
    handleKeyDown,
  } = useChatWindow();

  return (
    <ChatWindowTemplate
      messages={messages}
      inputValue={inputValue}
      isLoading={isLoading}
      error={error}
      placeholder={t('inputPlaceholder')}
      sendButtonLabel={t('sendButton')}
      emptyStateMessage={t('emptyState')}
      onInputChange={setInputValue}
      onSendMessage={handleSendMessage}
      onKeyDown={handleKeyDown}
    />
  );
};
