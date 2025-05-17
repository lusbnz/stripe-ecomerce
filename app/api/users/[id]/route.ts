import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function PUT(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.pathname.split('/').pop();
  const { name, email, password, address_id, role } = await req.json();

  if (!name || !email || !address_id) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    const { error: updateError } = await supabase
      .from('users')
      .update({
        name,
        email,
        password,
        address_id,
        role: role || 'CUSTOMER',
      })
      .eq('id', id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (fetchError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.pathname.split('/').pop();

  try {
    const { error: deleteError, count } = await supabase
      .from('users')
      .delete({ count: 'exact' })
      .eq('id', id)

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    if (!count) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'User deleted' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
