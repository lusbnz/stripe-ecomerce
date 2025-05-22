import { NextRequest, NextResponse } from 'next/server';

interface SSEClient {
  write: (data: WebhookData) => void;
  close: () => void;
}

interface WebhookData {
  status: 'SUCCESS' | 'FAIL' | string;
  [key: string]: unknown;
}

const clients = new Map<string, SSEClient>();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orderCode = searchParams.get('orderCode');

  if (!orderCode) {
    return new NextResponse('Missing orderCode', { status: 400 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      clients.set(orderCode, {
        write: (data: WebhookData) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        },
        close: () => controller.close(),
      });
    },
    cancel() {
      clients.delete(orderCode);
    },
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}

export { clients };
