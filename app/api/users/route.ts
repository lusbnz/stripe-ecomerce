import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  const { data, error } = await supabase.from('users').select('*');

  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Fetched user failed" }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const { name, email, password, address_id, role } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const { data, error } = await supabase.from('users').insert([
    {
      name,
      email,
      password,
      address_id,
      role: role || 'CUSTOMER',
    },
  ]).select('id').single();

  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Created user failed" }, { status: 500 });
  }

  return NextResponse.json({ id: data.id, message: 'User created' }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: 'Missing email or password' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('users')
    .select('id, name, email, role')
    .eq('email', email)
    .eq('password', password)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  return NextResponse.json({
    message: 'Login successful',
    user: data,
  });
}
