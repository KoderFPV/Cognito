import { describe, it, expect } from 'vitest';
import { chatMessageSchema, IChatMessageInput } from './chatSchemas';
import { ZodError } from 'zod';

describe('chatSchemas', () => {
  describe('chatMessageSchema', () => {
    describe('message field', () => {
      it('should accept valid message', () => {
        const input = { message: 'Hello, how can I help you?' };

        const result = chatMessageSchema.parse(input);

        expect(result.message).toBe('Hello, how can I help you?');
      });

      it('should reject empty message', () => {
        const input = { message: '' };

        expect(() => chatMessageSchema.parse(input)).toThrow(ZodError);
      });

      it('should reject message that is too long', () => {
        const input = { message: 'a'.repeat(2001) };

        expect(() => chatMessageSchema.parse(input)).toThrow(ZodError);
      });

      it('should accept message at maximum length', () => {
        const input = { message: 'a'.repeat(2000) };

        const result = chatMessageSchema.parse(input);

        expect(result.message.length).toBe(2000);
      });

      it('should accept single character message', () => {
        const input = { message: 'a' };

        const result = chatMessageSchema.parse(input);

        expect(result.message).toBe('a');
      });

      it('should reject missing message field', () => {
        const input = {};

        expect(() => chatMessageSchema.parse(input)).toThrow(ZodError);
      });

      it('should reject non-string message', () => {
        const input = { message: 123 };

        expect(() => chatMessageSchema.parse(input)).toThrow(ZodError);
      });
    });

    describe('sessionId field', () => {
      it('should accept valid UUID sessionId', () => {
        const input = {
          message: 'Hello',
          sessionId: '550e8400-e29b-41d4-a716-446655440000',
        };

        const result = chatMessageSchema.parse(input);

        expect(result.sessionId).toBe('550e8400-e29b-41d4-a716-446655440000');
      });

      it('should accept missing sessionId (optional)', () => {
        const input = { message: 'Hello' };

        const result = chatMessageSchema.parse(input);

        expect(result.sessionId).toBeUndefined();
      });

      it('should reject invalid UUID format', () => {
        const input = {
          message: 'Hello',
          sessionId: 'not-a-valid-uuid',
        };

        expect(() => chatMessageSchema.parse(input)).toThrow(ZodError);
      });

      it('should reject sessionId that is not a string', () => {
        const input = {
          message: 'Hello',
          sessionId: 12345,
        };

        expect(() => chatMessageSchema.parse(input)).toThrow(ZodError);
      });

      it('should reject empty string sessionId', () => {
        const input = {
          message: 'Hello',
          sessionId: '',
        };

        expect(() => chatMessageSchema.parse(input)).toThrow(ZodError);
      });

      it('should accept UUID v4 format', () => {
        const input = {
          message: 'Hello',
          sessionId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        };

        const result = chatMessageSchema.parse(input);

        expect(result.sessionId).toBe('f47ac10b-58cc-4372-a567-0e02b2c3d479');
      });
    });

    describe('type inference', () => {
      it('should produce correct type for valid input', () => {
        const input: IChatMessageInput = {
          message: 'Test message',
          sessionId: '550e8400-e29b-41d4-a716-446655440000',
        };

        const result = chatMessageSchema.parse(input);

        expect(result.message).toBe(input.message);
        expect(result.sessionId).toBe(input.sessionId);
      });

      it('should produce correct type for input without sessionId', () => {
        const input: IChatMessageInput = {
          message: 'Test message',
        };

        const result = chatMessageSchema.parse(input);

        expect(result.message).toBe(input.message);
        expect(result.sessionId).toBeUndefined();
      });
    });
  });
});
