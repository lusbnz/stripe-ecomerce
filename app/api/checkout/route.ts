import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const event = await request.json();
    console.log('[Webhook] Received event:', event);

    const {
      gateway,
      referenceCode,
      description,
    } = event;

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

    return NextResponse.redirect(new URL('/success', request.url));

  } catch (error) {
    console.error('[Webhook] Handler error:', error);
    return NextResponse.json({ error:  error instanceof Error ? error.message : error }, { status: 500 });
  }
}
