import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Missing verification token' }, { status: 400 });
    }

    // Find user by token
    const { data: user, error } = await supabase
      .from('users')
      .select('id, verification_token, is_verified')
      .eq('verification_token', token)
      .single();

    if (error || !user) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
    }

    if (user.is_verified) {
      return NextResponse.json({ message: 'Email already verified' }, { status: 200 });
    }

    // Update verification status
    const { error: updateError } = await supabase
      .from('users')
      .update({
        is_verified: true,
        verification_token: null,
        created_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({ message: 'Email verified successfully' }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error verifying email:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}