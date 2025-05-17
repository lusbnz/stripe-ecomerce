import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Join giữa Order và User (customer)
    const { data, error } = await supabase
      .from('orders')
      .select(`
        id, amount, customer_id,
        users!inner(name),
        payment_method, description, address_id,
        shipping_details, status, created_at, updated_at
      `);

    if (error) throw error;

    // Supabase trả về user dưới key 'User'
    // Nên mình chuyển lại key thành customer_name cho giống cũ
    const orders = data?.map(order => ({
      ...order,
      customer_name: order.users?.[0]?.name || "",
      User: undefined, // xóa key User
    }));

    return NextResponse.json(orders);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const {
    amount,
    customer_id,
    full_address,
    street,
    district,
    region,
    city,
    products,
    description
  } = await req.json();

  if (
    !amount ||
    !customer_id ||
    !full_address ||
    !street ||
    !district ||
    !region ||
    !city ||
    !Array.isArray(products) ||
    products.length === 0
  ) {
    return NextResponse.json({ error: 'Missing required fields or products' }, { status: 400 });
  }

  try {
    for (const item of products) {
      const { data: product, error: fetchErr } = await supabase
        .from('products')
        .select('quantity')
        .eq('id', item.productId)
        .single();

      if (fetchErr) {
        return NextResponse.json({ error: fetchErr.message }, { status: 500 });
      }

      if (!product || product.quantity < item.quantity) {
        return NextResponse.json({ error: 'Sản phẩm không đủ hàng' }, { status: 400 });
      }

      const { error: updateErr } = await supabase
        .from('products')
        .update({ quantity: product.quantity - item.quantity })
        .eq('id', item.productId);

      if (updateErr) {
        return NextResponse.json({ error: updateErr.message }, { status: 500 });
      }
    }

    // 1. Thêm địa chỉ
    const { data: addressData, error: addressError } = await supabase
      .from('addresses')
      .insert([{ full_address, street, district, region, city }])
      .select()
      .single();

    if (addressError) throw addressError;

    // 2. Thêm order (payment_method và status cứng như cũ)
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert([{
        amount,
        customer_id,
        payment_method: 'VNPAY',
        address_id: addressData.id,
        status: 'PENDING',
        description: description,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (orderError) throw orderError;

    // Nếu bạn cần lưu products vào bảng khác, cần thực hiện ở đây (không có trong đoạn gốc)

    return NextResponse.json(orderData, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
