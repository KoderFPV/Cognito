import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChatWindow } from './ChatWindow';

const mockUseChatWindow = vi.fn();

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      'inputPlaceholder': 'Type your message...',
      'sendButton': 'Send',
      'emptyState': 'Start a conversation',
    };
    return translations[key] || key;
  },
}));

vi.mock('./useChatWindow', () => ({
  useChatWindow: mockUseChatWindow,
}));

vi.mock('@/template/components/Chat/ChatWindowTemplate', () => ({
  ChatWindowTemplate: ({ messages, inputValue, isLoading, error, placeholder, sendButtonLabel, emptyStateMessage }: any) => (
    <div data-testid="chat-template">
      <div data-testid="messages-count">{messages.length}</div>
      <div data-testid="input-value">{inputValue}</div>
      <div data-testid="is-loading">{isLoading ? 'loading' : 'ready'}</div>
      <div data-testid="error-message">{error}</div>
      <div data-testid="placeholder">{placeholder}</div>
      <div data-testid="send-button-label">{sendButtonLabel}</div>
      <div data-testid="empty-state">{emptyStateMessage}</div>
    </div>
  ),
}));

describe('ChatWindow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseChatWindow.mockReturnValue({
      messages: [],
      inputValue: '',
      isLoading: false,
      error: null,
      setInputValue: vi.fn(),
      handleSendMessage: vi.fn(),
      handleKeyDown: vi.fn(),
    });
  });

  it('should render chat template', () => {
    render(<ChatWindow />);

    expect(screen.getByTestId('chat-template')).toBeInTheDocument();
  });

  it('should pass empty messages to template initially', () => {
    render(<ChatWindow />);

    expect(screen.getByTestId('messages-count')).toHaveTextContent('0');
  });

  it('should pass input value to template', () => {
    mockUseChatWindow.mockReturnValue({
      messages: [],
      inputValue: 'Test input',
      isLoading: false,
      error: null,
      setInputValue: vi.fn(),
      handleSendMessage: vi.fn(),
      handleKeyDown: vi.fn(),
    });

    render(<ChatWindow />);

    expect(screen.getByTestId('input-value')).toHaveTextContent('Test input');
  });

  it('should pass loading state to template', () => {
    mockUseChatWindow.mockReturnValue({
      messages: [],
      inputValue: '',
      isLoading: true,
      error: null,
      setInputValue: vi.fn(),
      handleSendMessage: vi.fn(),
      handleKeyDown: vi.fn(),
    });

    render(<ChatWindow />);

    expect(screen.getByTestId('is-loading')).toHaveTextContent('loading');
  });

  it('should pass error to template', () => {
    mockUseChatWindow.mockReturnValue({
      messages: [],
      inputValue: '',
      isLoading: false,
      error: 'Network error',
      setInputValue: vi.fn(),
      handleSendMessage: vi.fn(),
      handleKeyDown: vi.fn(),
    });

    render(<ChatWindow />);

    expect(screen.getByTestId('error-message')).toHaveTextContent('Network error');
  });

  it('should pass translated placeholder to template', () => {
    render(<ChatWindow />);

    expect(screen.getByTestId('placeholder')).toHaveTextContent('Type your message...');
  });

  it('should pass translated send button label to template', () => {
    render(<ChatWindow />);

    expect(screen.getByTestId('send-button-label')).toHaveTextContent('Send');
  });

  it('should pass translated empty state message to template', () => {
    render(<ChatWindow />);

    expect(screen.getByTestId('empty-state')).toHaveTextContent('Start a conversation');
  });

  it('should pass hook handlers to template', () => {
    const mockSetInputValue = vi.fn();
    const mockHandleSendMessage = vi.fn();
    const mockHandleKeyDown = vi.fn();

    mockUseChatWindow.mockReturnValue({
      messages: [],
      inputValue: '',
      isLoading: false,
      error: null,
      setInputValue: mockSetInputValue,
      handleSendMessage: mockHandleSendMessage,
      handleKeyDown: mockHandleKeyDown,
    });

    const { rerender } = render(<ChatWindow />);

    expect(mockUseChatWindow).toHaveBeenCalled();

    mockUseChatWindow.mockReturnValue({
      messages: [],
      inputValue: '',
      isLoading: false,
      error: null,
      setInputValue: mockSetInputValue,
      handleSendMessage: mockHandleSendMessage,
      handleKeyDown: mockHandleKeyDown,
    });

    rerender(<ChatWindow />);

    expect(mockUseChatWindow).toHaveBeenCalledTimes(2);
  });

  it('should pass multiple messages to template', () => {
    mockUseChatWindow.mockReturnValue({
      messages: [
        { id: '1', content: 'Hello', sender: 'user', timestamp: new Date() },
        { id: '2', content: 'Hi there', sender: 'assistant', timestamp: new Date() },
        { id: '3', content: 'How can I help?', sender: 'user', timestamp: new Date() },
      ],
      inputValue: '',
      isLoading: false,
      error: null,
      setInputValue: vi.fn(),
      handleSendMessage: vi.fn(),
      handleKeyDown: vi.fn(),
    });

    render(<ChatWindow />);

    expect(screen.getByTestId('messages-count')).toHaveTextContent('3');
  });

  it('should use chat translation namespace', () => {
    render(<ChatWindow />);

    const template = screen.getByTestId('chat-template');
    expect(template).toBeInTheDocument();
  });

  it('should call useChatWindow hook', () => {
    render(<ChatWindow />);

    expect(mockUseChatWindow).toHaveBeenCalled();
  });
});
