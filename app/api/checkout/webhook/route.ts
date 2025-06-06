import { clients } from '@/lib/sse-client';
import { NextRequest, NextResponse } from 'next/server';

interface WebhookRequestBody {
  description?: string;
  content?: string;
  data?: {
    description?: string;
    content?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

interface WebhookData {
  status: 'SUCCESS' | 'FAIL' | string;
  [key: string]: unknown;
}

export async function POST(req: NextRequest) {
  const body: WebhookRequestBody = await req.json();

  const description = body.description || body.content || body.data?.description || body.data?.content || "";
  const orderCodeMatch = description.match(/ORD\d+/);
  const orderCode = orderCodeMatch?.[0];

  if (!orderCode) {
    console.log('[Webhook] No orderCode found in description:', body, description);
    return NextResponse.json({ success: false });
  }

  const client = clients.get(orderCode);
  if (client) {
    try {
      const data: WebhookData = { status: 'SUCCESS' };
      client.write(data);
      client.close();
      clients.delete(orderCode);
      console.log(`[Webhook] Sent SUCCESS event to client with orderCode: ${orderCode}`);
    } catch (error) {
      console.error('[Webhook] Error sending SSE message:', error);
    }
  } else {
    console.log(`[Webhook] No client found for orderCode: ${orderCode}`);
  }

  return NextResponse.json({ success: true });
}
