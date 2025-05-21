import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        id, amount, customer_id,
        users(name),
        payment_method, description, address_id,
        shipping_details, status, created_at, updated_at
      `);

    if (error) throw error;

    const orders = (data).map((order) => ({
      ...order,
    }));

    return NextResponse.json(orders);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { amount, customer_id, address_id, products, description } = await req.json();

  if (
    !amount ||
    !customer_id ||
    !address_id ||
    !Array.isArray(products) ||
    products.length === 0 ||
    !description?.trim()
  ) {
    return NextResponse.json(
      { error: 'Missing required fields or products' },
      { status: 400 },
    );
  }

  try {
    // Check if customer exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', customer_id)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 },
      );
    }

    // Check if address exists
    const { data: address, error: addressError } = await supabase
      .from('addresses')
      .select('id')
      .eq('id', address_id)
      .single();

    if (addressError || !address) {
      return NextResponse.json(
        { error: 'Address not found' },
        { status: 404 },
      );
    }

    // Update product quantities
    for (const item of products) {
      const productId = Number(item.id);
      const quantity = Number(item.quantity);

      if (!productId || isNaN(productId) || !quantity || isNaN(quantity)) {
        return NextResponse.json(
          { error: 'Invalid productId or quantity' },
          { status: 400 },
        );
      }

      const { data: product, error: fetchErr } = await supabase
        .from('products')
        .select('quantity')
        .eq('id', item.id)
        .single();

      if (fetchErr) {
        return NextResponse.json({ error: fetchErr.message }, { status: 500 });
      }

      if (!product || product.quantity < item.quantity) {
        return NextResponse.json(
          { error: 'Product out of stock' },
          { status: 400 },
        );
      }

      const { error: updateErr } = await supabase
        .from('products')
        .update({ quantity: product.quantity - item.quantity })
        .eq('id', item.id);

      if (updateErr) {
        return NextResponse.json({ error: updateErr.message }, { status: 500 });
      }
    }

    // Insert order
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert([
        {
          amount,
          customer_id,
          payment_method: 'VNPAY',
          address_id,
          status: 'PENDING',
          description,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (orderError) throw orderError;

    return NextResponse.json(orderData, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}