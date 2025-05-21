import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import bcrypt from "bcrypt"

export async function GET() {
  const { data, error } = await supabase.from('users').select('*');

  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Fetched user failed" }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, address_id, role } = await req.json();

    // Manual validation
    if (!name?.trim() || !email?.trim() || !password?.trim()) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 },
      );
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 },
      );
    }
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 },
      );
    }
    if (role && !['CUSTOMER', 'ADMIN'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be CUSTOMER or ADMIN' },
        { status: 400 },
      );
    }
    if (address_id && isNaN(Number(address_id))) {
      return NextResponse.json(
        { error: 'Invalid address ID' },
        { status: 400 },
      );
    }

    // Check if email already exists
    const { data: existingUser, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 409 },
      );
    }
    if (userError && userError.code !== 'PGRST116') {
      throw userError;
    }

    // Validate address_id if provided
    if (address_id) {
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
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user and select all fields
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          name: name || email, // Fallback to email if name is empty
          email,
          password: hashedPassword,
          address_id: address_id || null,
          role: role || 'CUSTOMER',
          created_at: new Date().toISOString(),
        },
      ])
      .select('*') // Select all fields
      .single();

    if (error || !data) {
      console.error('User insert error:', error?.message || 'No data returned');
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { message: 'User created', user: data },
      { status: 201 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error creating user:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
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
