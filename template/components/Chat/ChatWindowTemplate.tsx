import styles from './ChatWindowTemplate.module.scss';

export interface IChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

export interface ChatWindowTemplateProps {
  messages: IChatMessage[];
  inputValue: string;
  isLoading: boolean;
  error: string | null;
  placeholder: string;
  sendButtonLabel: string;
  emptyStateMessage: string;
  onInputChange: (value: string) => void;
  onSendMessage: () => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  textareaRef?: React.RefObject<HTMLTextAreaElement | null>;
}

export const ChatWindowTemplate = ({
  messages,
  inputValue,
  isLoading,
  error,
  placeholder,
  sendButtonLabel,
  emptyStateMessage,
  onInputChange,
  onSendMessage,
  onKeyDown,
  textareaRef,
}: ChatWindowTemplateProps) => {
  return (
    <div className={styles.chatWindow}>
      <div className={styles.messagesContainer}>
        {messages.length === 0 && !isLoading ? (
          <div className={styles.emptyState}>
            <p>{emptyStateMessage}</p>
          </div>
        ) : (
          <div className={styles.messagesList}>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`${styles.message} ${styles[message.sender]}`}
                data-sender={message.sender}
              >
                <div className={styles.messageBubble}>{message.content}</div>
              </div>
            ))}
            {isLoading && (
              <div className={`${styles.message} ${styles.assistant}`} data-sender="assistant">
                <div className={styles.messageBubble}>
                  <div className={styles.loader} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {error && <div className={styles.errorMessage}>{error}</div>}

      <div className={styles.inputContainer}>
        <textarea
          ref={textareaRef}
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className={styles.input}
          readOnly={isLoading}
          rows={3}
        />
        <button
          onClick={onSendMessage}
          className={styles.sendButton}
          disabled={isLoading || !inputValue.trim()}
        >
          {sendButtonLabel}
        </button>
      </div>
    </div>
  );
};
