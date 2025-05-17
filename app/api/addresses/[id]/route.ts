import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function PUT(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.pathname.split('/').pop();
  const { full_address, street, district, region, city } = await req.json();

  if (!full_address || !city) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  if (!id) {
    return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
  }

  try {
    const { data, error } = await supabase
      .from('addresses')
      .update({
        full_address,
        street: street || '',
        district: district || '',
        region: region || '',
        city,
      })
      .eq('id', id)
      .select() // để lấy dữ liệu trả về nếu cần
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Address updated', address: data });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.pathname.split('/').pop();

  if (!id) {
    return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
  }

  try {
    const { error, count } = await supabase
      .from('addresses')
      .delete()
      .eq('id', id)
      .select(); // gọi select() để lấy count hoặc kiểm tra xóa thành công

    if (error) throw error;

    if (count === 0) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Address deleted' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
