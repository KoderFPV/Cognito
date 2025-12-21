import { NextRequest, NextResponse } from 'next/server';
import { getTranslations } from 'next-intl/server';
import { ZodError } from 'zod';
import { getLocaleFromRequest } from '@/services/locale/locale.service';
import { init as initZodI18n } from '@/services/validation/validation.service';
import { chatMessageSchema } from '@/services/chat/schemas/chatSchemas';
import { streamChatResponse } from '@/services/chat/chat.service';

export const POST = async (request: NextRequest) => {
  const locale = getLocaleFromRequest(request);
  const t = await getTranslations({ locale, namespace: 'api.chat' });

  try {
    const body = await request.json();
    await initZodI18n(locale);
    const validatedData = chatMessageSchema.parse(body);

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          await streamChatResponse(
            validatedData.message,
            locale,
            validatedData.sessionId,
            {
              onToken: (token: string) => {
                const data = JSON.stringify({ type: 'token', content: token });
                controller.enqueue(
                  encoder.encode(`event: message\ndata: ${data}\n\n`)
                );
              },
              onComplete: (messageId: string, sessionId: string) => {
                const data = JSON.stringify({
                  type: 'complete',
                  messageId,
                  sessionId,
                });
                controller.enqueue(
                  encoder.encode(`event: message\ndata: ${data}\n\n`)
                );
                controller.enqueue(
                  encoder.encode('event: close\ndata: [DONE]\n\n')
                );
                controller.close();
              },
              onError: (error: Error) => {
                const data = JSON.stringify({
                  type: 'error',
                  message: error.message,
                });
                controller.enqueue(
                  encoder.encode(`event: error\ndata: ${data}\n\n`)
                );
                controller.close();
              },
            }
          );
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : t('processingFailed');
          const data = JSON.stringify({ type: 'error', message: errorMessage });
          controller.enqueue(encoder.encode(`event: error\ndata: ${data}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { message: t('validationFailed'), details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: t('processingFailed') }, { status: 500 });
  }
};
