import { z } from 'zod';

const MESSAGE_MAX_LENGTH = 2000;

export const chatMessageSchema = z.object({
  message: z.string().min(1).max(MESSAGE_MAX_LENGTH),
  sessionId: z.string().uuid().optional(),
});

export type IChatMessageInput = z.infer<typeof chatMessageSchema>;
