import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.pathname.split('/').pop();

  if (!id) {
    return NextResponse.json({ error: 'Missing order id' }, { status: 400 });
  }

  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.pathname.split('/').pop();
  const {
    amount, payment_method, description,
    address_id, shipping_details, status
  } = await req.json();

  if (!id) {
    return NextResponse.json({ error: 'Missing order id' }, { status: 400 });
  }

  try {
    const { data, error } = await supabase
      .from('orders')
      .update({
        amount,
        payment_method,
        description,
        address_id,
        shipping_details,
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.pathname.split('/').pop();

  if (!id) {
    return NextResponse.json({ error: 'Missing order id' }, { status: 400 });
  }

  try {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id);

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json({ message: 'Order deleted successfully' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
