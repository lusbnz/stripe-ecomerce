import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.pathname.split('/').pop();

  if (!id) {
    return NextResponse.json({ error: 'Missing customer id' }, { status: 400 });
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .select(`
        id, name, email, role, created_at,
        addresses:address_id (
          full_address, street, district, region, city
        )
      `)
      .eq('id', id)
      .eq('role', 'CUSTOMER')
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // not found
        return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
      }
      throw error;
    }

    if (!data) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
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
  const { name, email } = await req.json();

  if (!id) {
    return NextResponse.json({ error: 'Missing customer id' }, { status: 400 });
  }
  if (!name || !email) {
    return NextResponse.json({ error: 'Missing name or email' }, { status: 400 });
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .update({ name, email })
      .eq('id', id)
      .eq('role', 'CUSTOMER')
      .select()
      .single();

    if (error) throw error;
    if (!data) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    // Lấy lại bản ghi sau cập nhật, kèm address
    const { data: updatedUser, error: fetchError } = await supabase
      .from('users')
      .select(`
        id, name, email, role, created_at,
        addresses:address_id (
          full_address, street, district, region, city
        )
      `)
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    return NextResponse.json(updatedUser);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.pathname.split('/').pop();

  if (!id) {
    return NextResponse.json({ error: 'Missing customer id' }, { status: 400 });
  }

  try {
    // Lấy address_id trước khi xóa user
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('address_id')
      .eq('id', id)
      .eq('role', 'CUSTOMER')
      .single();

    if (userError || !userData) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    // Xóa user
    const { error: deleteUserError } = await supabase
      .from('users')
      .delete()
      .eq('id', id)
      .eq('role', 'CUSTOMER');

    if (deleteUserError) throw deleteUserError;

    // Nếu có address_id thì xóa address luôn
    if (userData.address_id) {
      const { error: deleteAddressError } = await supabase
        .from('addresses')
        .delete()
        .eq('id', userData.address_id);

      if (deleteAddressError) throw deleteAddressError;
    }

    return NextResponse.json({ message: 'Customer deleted successfully' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
