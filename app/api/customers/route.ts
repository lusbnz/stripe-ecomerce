import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select(`
        id, name, email, role, created_at,
        addresses:address_id (
          full_address, street, district, region, city
        )
      `)
      .eq('role', 'CUSTOMER');

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { name, email } = await req.json();

  if (!name || !email) {
    return NextResponse.json({ error: 'Missing name or email' }, { status: 400 });
  }

  try {
    const { data: insertedUser, error: insertError } = await supabase
      .from('users')
      .insert({
        name,
        email,
        password: '12345678',  // Thường bạn sẽ hash mật khẩu, đây chỉ demo
        role: 'CUSTOMER',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) throw insertError;

    // Lấy thêm thông tin Address (nếu có)
    const { data: userWithAddress, error: fetchError } = await supabase
      .from('users')
      .select(`
        id, name, email, role, created_at,
        addresses:address_id (
          full_address, street, district, region, city
        )
      `)
      .eq('id', insertedUser.id)
      .single();

    if (fetchError) throw fetchError;

    return NextResponse.json(userWithAddress, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
