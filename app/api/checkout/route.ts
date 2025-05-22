import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const clients = new Map<string, WritableStreamDefaultWriter>();

export async function POST(request: NextRequest) {
  try {
    const event = await request.json();
    console.log('[Webhook] Received event:', event);

    const { gateway, referenceCode, description } = event;

    console.log('[Webhook] referenceCode:', referenceCode);
    console.log('[Webhook] gateway:', gateway);
    console.log('[Webhook] description:', description);

    const orderCodeMatch = description.match(/ORD\d+/);
    const orderCode = orderCodeMatch ? orderCodeMatch[0] : null;

    if (!orderCode) {
      console.error('[Webhook] Cannot extract order code from description');
      return NextResponse.json({ error: 'Invalid description format' }, { status: 400 });
    }

    const { data: orderData, error: findError } = await supabase
      .from('orders')
      .select('*')
      .eq('description', orderCode)
      .single();

    if (findError || !orderData) {
      console.error('[Webhook] Order not found or DB error:', findError);
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    console.log('[Webhook] Found order:', orderData);

    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'SUCCESS',
        payment_method: gateway,
        description: description || referenceCode,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderData.id)
      .select()
      .single();

    if (updateError) {
      console.error('[Webhook] Error updating order:', updateError);
      return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
    }

    console.log('[Webhook] Updated order:', updatedOrder);

    // Send SSE message to the client
    const writer = clients.get(orderCode);
    if (writer) {
      try {
        await writer.write(
          new TextEncoder().encode(`data: ${JSON.stringify({ status: 'SUCCESS' })}\n\n`)
        );
        // Close the writer and remove from clients
        await writer.close();
        clients.delete(orderCode);
      } catch (error) {
        console.error('[Webhook] Error sending SSE message:', error);
      }
    } else {
      console.log('[Webhook] No client found for orderCode:', orderCode);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('[Webhook] Handler error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const orderCode = searchParams.get('orderCode');

  if (!orderCode) {
    return NextResponse.json(
      { error: 'Missing orderCode parameter' },
      { status: 400 }
    );
  }

  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  clients.set(orderCode, writer);

  const headers = {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  };

  const keepAlive = setInterval(() => {
    writer.write(new TextEncoder().encode(': keep-alive\n\n')).catch(() => {
      clearInterval(keepAlive);
      clients.delete(orderCode);
      writer.close();
    });
  }, 15000);

  request.signal.addEventListener('abort', () => {
    clearInterval(keepAlive);
    clients.delete(orderCode);
    writer.close();
  });

  return new NextResponse(stream.readable, { headers });
}