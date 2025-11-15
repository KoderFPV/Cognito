import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useChatWindow } from './useChatWindow';

describe('useChatWindow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with empty values', () => {
    const { result } = renderHook(() => useChatWindow());

    expect(result.current.messages).toEqual([]);
    expect(result.current.inputValue).toBe('');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should update input value', () => {
    const { result } = renderHook(() => useChatWindow());

    act(() => {
      result.current.setInputValue('Hello');
    });

    expect(result.current.inputValue).toBe('Hello');
  });

  it('should set error message', () => {
    const { result } = renderHook(() => useChatWindow());
    const errorMessage = 'Something went wrong';

    act(() => {
      result.current.setError(errorMessage);
    });

    expect(result.current.error).toBe(errorMessage);
  });

  it('should clear error message', () => {
    const { result } = renderHook(() => useChatWindow());

    act(() => {
      result.current.setError('Error');
    });

    expect(result.current.error).toBe('Error');

    act(() => {
      result.current.setError(null);
    });

    expect(result.current.error).toBeNull();
  });

  it('should set loading state', () => {
    const { result } = renderHook(() => useChatWindow());

    expect(result.current.isLoading).toBe(false);

    act(() => {
      result.current.setIsLoading(true);
    });

    expect(result.current.isLoading).toBe(true);
  });

  it('should add user message', () => {
    const { result } = renderHook(() => useChatWindow());
    const message = 'User test message';

    act(() => {
      result.current.addMessage(message, 'user');
    });

    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].content).toBe(message);
    expect(result.current.messages[0].sender).toBe('user');
    expect(result.current.messages[0].id).toBeDefined();
    expect(result.current.messages[0].timestamp).toBeInstanceOf(Date);
  });

  it('should add assistant message', () => {
    const { result } = renderHook(() => useChatWindow());
    const message = 'Assistant test message';

    act(() => {
      result.current.addMessage(message, 'assistant');
    });

    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].content).toBe(message);
    expect(result.current.messages[0].sender).toBe('assistant');
  });

  it('should add multiple messages in sequence', () => {
    const { result } = renderHook(() => useChatWindow());

    act(() => {
      result.current.addMessage('First message', 'user');
      result.current.addMessage('Second message', 'assistant');
      result.current.addMessage('Third message', 'user');
    });

    expect(result.current.messages).toHaveLength(3);
    expect(result.current.messages[0].content).toBe('First message');
    expect(result.current.messages[1].content).toBe('Second message');
    expect(result.current.messages[2].content).toBe('Third message');
  });

  it('should handle send message with input', () => {
    const { result } = renderHook(() => useChatWindow());
    const testMessage = 'Test message to send';

    act(() => {
      result.current.setInputValue(testMessage);
    });

    act(() => {
      result.current.handleSendMessage();
    });

    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].content).toBe(testMessage);
    expect(result.current.messages[0].sender).toBe('user');
    expect(result.current.inputValue).toBe('');
  });

  it('should not send message with empty input', () => {
    const { result } = renderHook(() => useChatWindow());

    act(() => {
      result.current.setInputValue('');
      result.current.handleSendMessage();
    });

    expect(result.current.messages).toHaveLength(0);
  });

  it('should not send message with whitespace only', () => {
    const { result } = renderHook(() => useChatWindow());

    act(() => {
      result.current.setInputValue('   ');
      result.current.handleSendMessage();
    });

    expect(result.current.messages).toHaveLength(0);
  });

  it('should set loading state on send', () => {
    const { result } = renderHook(() => useChatWindow());

    act(() => {
      result.current.setInputValue('Test message');
    });

    act(() => {
      result.current.handleSendMessage();
    });

    expect(result.current.isLoading).toBe(true);
  });

  it('should clear error on send', () => {
    const { result } = renderHook(() => useChatWindow());

    act(() => {
      result.current.setError('Previous error');
    });

    act(() => {
      result.current.setInputValue('New message');
    });

    act(() => {
      result.current.handleSendMessage();
    });

    expect(result.current.error).toBeNull();
  });

  it('should clear input after sending message', () => {
    const { result } = renderHook(() => useChatWindow());

    act(() => {
      result.current.setInputValue('Message to clear');
    });

    act(() => {
      result.current.handleSendMessage();
    });

    expect(result.current.inputValue).toBe('');
  });

  it('should handle keyDown with Enter key', () => {
    const { result } = renderHook(() => useChatWindow());
    const mockEvent = {
      key: 'Enter',
      shiftKey: false,
      preventDefault: vi.fn(),
    } as any;

    act(() => {
      result.current.setInputValue('Test message');
    });

    act(() => {
      result.current.handleKeyDown(mockEvent);
    });

    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(result.current.messages).toHaveLength(1);
  });

  it('should not send on Enter when Shift is pressed', () => {
    const { result } = renderHook(() => useChatWindow());
    const mockEvent = {
      key: 'Enter',
      shiftKey: true,
      preventDefault: vi.fn(),
    } as any;

    act(() => {
      result.current.setInputValue('Test message');
      result.current.handleKeyDown(mockEvent);
    });

    expect(mockEvent.preventDefault).not.toHaveBeenCalled();
    expect(result.current.messages).toHaveLength(0);
  });

  it('should not send on other keys', () => {
    const { result } = renderHook(() => useChatWindow());
    const mockEvent = {
      key: 'ArrowUp',
      shiftKey: false,
      preventDefault: vi.fn(),
    } as any;

    act(() => {
      result.current.setInputValue('Test message');
      result.current.handleKeyDown(mockEvent);
    });

    expect(mockEvent.preventDefault).not.toHaveBeenCalled();
    expect(result.current.messages).toHaveLength(0);
  });

  it('should maintain message history across operations', () => {
    const { result } = renderHook(() => useChatWindow());

    act(() => {
      result.current.setInputValue('First user message');
    });

    act(() => {
      result.current.handleSendMessage();
    });

    act(() => {
      result.current.addMessage('AI response', 'assistant');
    });

    act(() => {
      result.current.setInputValue('Second user message');
    });

    act(() => {
      result.current.handleSendMessage();
    });

    expect(result.current.messages).toHaveLength(3);
    expect(result.current.messages[0].sender).toBe('user');
    expect(result.current.messages[1].sender).toBe('assistant');
    expect(result.current.messages[2].sender).toBe('user');
  });

  it('should generate unique IDs for messages', () => {
    const { result } = renderHook(() => useChatWindow());

    act(() => {
      result.current.addMessage('Message 1', 'user');
      result.current.addMessage('Message 2', 'user');
      result.current.addMessage('Message 3', 'user');
    });

    const ids = result.current.messages.map((m) => m.id);
    const uniqueIds = new Set(ids);

    expect(uniqueIds.size).toBe(3);
  });
});
