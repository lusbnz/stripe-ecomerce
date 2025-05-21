import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

// Configure nodemailer
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/verify?token=${token}`;
  
  await transporter.sendMail({
    from: '"Quốc Việt" <tslcvnm@gmail.com@gmail.com>',
    to: email,
    subject: 'Xác minh tài khoản của bạn',
    html: `
      <h1>Xác minh email</h1>
      <p>Vui lòng nhấn vào link sau để xác minh tài khoản:</p>
      <a href="${verificationUrl}">${verificationUrl}</a>
      <p>Link này có hiệu lực trong 24 giờ.</p>
    `,
  });
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, role, created_at, is_verified');

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

    // Create verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Insert user
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          name: name || email,
          email,
          password: password,
          role: role || 'CUSTOMER',
          created_at: new Date().toISOString(),
          verification_token: verificationToken,
          is_verified: false,
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

    // Send verification email
    await sendVerificationEmail(email, verificationToken);

    return NextResponse.json(
      { message: 'User created. Please check your email to verify your account.', user: data },
      { status: 201 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error creating user:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Missing email or password' }, { status: 400 });
    }

    // Get user by email
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, password, role, is_verified')
      .eq('email', email)
      .single();

      console.log('user', user);
      console.log('error', error);

    if (error || !user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Verify password
    const isPasswordValid = password === user.password;
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    return NextResponse.json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        is_verified: user.is_verified,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error logging in:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}