import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcrypt';

interface User {
  id?: string;
  name: string;
  email: string;
  password?: string;
  role: string;
  created_at?: string;
  updated_at?: string;
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, role, created_at');

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching users:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, role } = await req.json();

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

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user and select all fields
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          name: name || email,
          email,
          password: hashedPassword,
          role: role || 'CUSTOMER',
          created_at: new Date().toISOString(),
        },
      ])
      .select('*')
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

export async function PUT(req: NextRequest) {
  try {
    const { id, name, email, password, role } = await req.json();

    const updateData: Partial<User> = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (password) updateData.password = password;

    const { data: updatedUser, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }

    return NextResponse.json({ message: 'User updated', user: updatedUser }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error updating user:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
  const id = url.pathname.split('/').pop();

    if (!id || isNaN(Number(id))) {
      return NextResponse.json({ error: 'Valid user ID is required' }, { status: 400 });
    }

    try {
      // Check dependencies
      const { data: orders } = await supabase
        .from('orders')
        .select('id')
        .eq('customer_id', id)
        .limit(1);

      if (orders?.length) {
        throw new Error('Cannot delete user with associated orders');
      }

      const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json({ message: 'User deleted successfully' });
    } catch (error) {
      // Rollback transaction
      await supabase.rpc('rollback_transaction');
      throw error;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error deleting user:', message);
    return NextResponse.json(
      { error: message },
      { status: message.includes('not found') ? 404 : 409 }
    );
  }
}