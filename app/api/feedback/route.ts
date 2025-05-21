import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.userId || isNaN(body.userId)) {
      return NextResponse.json(
        { message: 'Invalid user ID' },
        { status: 400 },
      );
    }
    if (!body.feedback || body.feedback.length < 10) {
      return NextResponse.json(
        { message: 'Feedback must be at least 10 characters' },
        { status: 400 },
      );
    }

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', body.userId)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 },
      );
    }

    const { data: newFeedback, error: feedbackError } = await supabase
      .from('feedback')
      .insert({
        content: body.feedback,
        user_id: body.userId,
      })
      .select()
      .single();

    if (feedbackError) {
      throw new Error(feedbackError.message);
    }

    return NextResponse.json(
      { message: 'Feedback submitted successfully', data: newFeedback },
      { status: 201 },
    );
  } catch (error: unknown) {
    console.error('Error saving feedback:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const { data: feedbacks, error } = await supabase
      .from('feedback')
      .select('*, users(id, name, email)');

    if (error) throw new Error(error.message);

    return NextResponse.json({ data: feedbacks });
  } catch (error: unknown) {
    console.error('Error fetching feedback:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 },
    );
  }
}