import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatWindowTemplate, IChatMessage } from './ChatWindowTemplate';

describe('ChatWindowTemplate', () => {
  const mockOnInputChange = vi.fn();
  const mockOnSendMessage = vi.fn();
  const mockOnKeyDown = vi.fn();

  const defaultProps = {
    messages: [] as IChatMessage[],
    inputValue: '',
    isLoading: false,
    error: null,
    placeholder: 'Type your message...',
    sendButtonLabel: 'Send',
    emptyStateMessage: 'Start a conversation',
    onInputChange: mockOnInputChange,
    onSendMessage: mockOnSendMessage,
    onKeyDown: mockOnKeyDown,
  };

  it('should render empty state when no messages', () => {
    render(<ChatWindowTemplate {...defaultProps} />);

    expect(screen.getByText('Start a conversation')).toBeInTheDocument();
  });

  it('should render textarea with correct placeholder', () => {
    render(<ChatWindowTemplate {...defaultProps} />);

    const textarea = screen.getByPlaceholderText('Type your message...');
    expect(textarea).toBeInTheDocument();
  });

  it('should render send button with correct label', () => {
    render(<ChatWindowTemplate {...defaultProps} />);

    const button = screen.getByRole('button', { name: 'Send' });
    expect(button).toBeInTheDocument();
  });

  it('should render user message with correct styling', () => {
    const messages: IChatMessage[] = [
      {
        id: '1',
        content: 'Hello',
        sender: 'user',
        timestamp: new Date(),
      },
    ];

    render(<ChatWindowTemplate {...defaultProps} messages={messages} />);

    const message = screen.getByText('Hello');
    const messageContainer = message.closest('[data-sender="user"]');

    expect(messageContainer).toHaveAttribute('data-sender', 'user');
  });

  it('should render assistant message with correct styling', () => {
    const messages: IChatMessage[] = [
      {
        id: '1',
        content: 'Hi there',
        sender: 'assistant',
        timestamp: new Date(),
      },
    ];

    render(<ChatWindowTemplate {...defaultProps} messages={messages} />);

    const message = screen.getByText('Hi there');
    const messageContainer = message.closest('[data-sender="assistant"]');

    expect(messageContainer).toHaveAttribute('data-sender', 'assistant');
  });

  it('should render multiple messages', () => {
    const messages: IChatMessage[] = [
      {
        id: '1',
        content: 'First message',
        sender: 'user',
        timestamp: new Date(),
      },
      {
        id: '2',
        content: 'Second message',
        sender: 'assistant',
        timestamp: new Date(),
      },
      {
        id: '3',
        content: 'Third message',
        sender: 'user',
        timestamp: new Date(),
      },
    ];

    render(<ChatWindowTemplate {...defaultProps} messages={messages} />);

    expect(screen.getByText('First message')).toBeInTheDocument();
    expect(screen.getByText('Second message')).toBeInTheDocument();
    expect(screen.getByText('Third message')).toBeInTheDocument();
  });

  it('should display error message when error exists', () => {
    render(
      <ChatWindowTemplate
        {...defaultProps}
        error="Failed to send message"
      />
    );

    expect(screen.getByText('Failed to send message')).toBeInTheDocument();
  });

  it('should not display error message when error is null', () => {
    const { container } = render(
      <ChatWindowTemplate
        {...defaultProps}
        error={null}
      />
    );

    const errorElements = container.querySelectorAll('[class*="error"]');
    const hasError = Array.from(errorElements).some((el) =>
      el.textContent?.includes('error')
    );

    expect(hasError).toBe(false);
  });

  it('should update textarea value on input change', async () => {
    const user = userEvent.setup();
    render(<ChatWindowTemplate {...defaultProps} />);

    const textarea = screen.getByPlaceholderText('Type your message...');
    await user.type(textarea, 'Test message');

    expect(mockOnInputChange).toHaveBeenCalledWith('T');
    expect(mockOnInputChange).toHaveBeenCalled();
  });

  it('should call onSendMessage when send button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <ChatWindowTemplate
        {...defaultProps}
        inputValue="Test message"
      />
    );

    const button = screen.getByRole('button', { name: 'Send' });
    await user.click(button);

    expect(mockOnSendMessage).toHaveBeenCalled();
  });

  it('should disable send button when input is empty', () => {
    render(
      <ChatWindowTemplate
        {...defaultProps}
        inputValue=""
      />
    );

    const button = screen.getByRole('button', { name: 'Send' });
    expect(button).toBeDisabled();
  });

  it('should disable send button when input is whitespace only', () => {
    render(
      <ChatWindowTemplate
        {...defaultProps}
        inputValue="   "
      />
    );

    const button = screen.getByRole('button', { name: 'Send' });
    expect(button).toBeDisabled();
  });

  it('should enable send button when input has content', () => {
    render(
      <ChatWindowTemplate
        {...defaultProps}
        inputValue="Some message"
      />
    );

    const button = screen.getByRole('button', { name: 'Send' });
    expect(button).not.toBeDisabled();
  });

  it('should disable textarea during loading', () => {
    render(
      <ChatWindowTemplate
        {...defaultProps}
        isLoading={true}
      />
    );

    const textarea = screen.getByPlaceholderText('Type your message...');
    expect(textarea).toBeDisabled();
  });

  it('should disable send button during loading', () => {
    render(
      <ChatWindowTemplate
        {...defaultProps}
        isLoading={true}
        inputValue="Message"
      />
    );

    const button = screen.getByRole('button', { name: 'Send' });
    expect(button).toBeDisabled();
  });

  it('should call onKeyDown when textarea key is pressed', async () => {
    const user = userEvent.setup();
    render(<ChatWindowTemplate {...defaultProps} />);

    const textarea = screen.getByPlaceholderText('Type your message...');
    await user.type(textarea, '{Enter}');

    expect(mockOnKeyDown).toHaveBeenCalled();
  });

  it('should show loading indicator during isLoading state', () => {
    const { container } = render(
      <ChatWindowTemplate
        {...defaultProps}
        isLoading={true}
      />
    );

    const loader = container.querySelector('[class*="loader"]');
    expect(loader).toBeInTheDocument();
  });

  it('should maintain input value when prop updates', () => {
    const { rerender } = render(
      <ChatWindowTemplate
        {...defaultProps}
        inputValue="Initial value"
      />
    );

    const textarea = screen.getByPlaceholderText('Type your message...') as HTMLTextAreaElement;
    expect(textarea.value).toBe('Initial value');

    rerender(
      <ChatWindowTemplate
        {...defaultProps}
        inputValue="Updated value"
      />
    );

    expect(textarea.value).toBe('Updated value');
  });

  it('should render textarea with correct rows', () => {
    render(<ChatWindowTemplate {...defaultProps} />);

    const textarea = screen.getByPlaceholderText('Type your message...');
    expect(textarea).toHaveAttribute('rows', '3');
  });

  it('should render messages list without empty state when messages exist', () => {
    const messages: IChatMessage[] = [
      {
        id: '1',
        content: 'Test message',
        sender: 'user',
        timestamp: new Date(),
      },
    ];

    render(<ChatWindowTemplate {...defaultProps} messages={messages} />);

    expect(screen.getByText('Test message')).toBeInTheDocument();
    expect(screen.queryByText('Start a conversation')).not.toBeInTheDocument();
  });

  it('should render messages with unique keys', () => {
    const messages: IChatMessage[] = [
      {
        id: 'msg-1',
        content: 'Message 1',
        sender: 'user',
        timestamp: new Date(),
      },
      {
        id: 'msg-2',
        content: 'Message 2',
        sender: 'assistant',
        timestamp: new Date(),
      },
    ];

    const { container } = render(
      <ChatWindowTemplate {...defaultProps} messages={messages} />
    );

    const messageElements = container.querySelectorAll('[class*="message"]');
    expect(messageElements.length).toBeGreaterThanOrEqual(2);
  });
});
