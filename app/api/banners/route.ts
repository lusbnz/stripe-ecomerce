import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data: banners, error } = await supabase
      .from('banners')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    return NextResponse.json({ data: banners });
  } catch (error: unknown) {
    console.error('Error fetching banners:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Manual validation
    if (!body.image_url || !body.image_url.trim()) {
      return NextResponse.json(
        { message: 'Image URL is required' },
        { status: 400 },
      );
    }
    if (body.alt_text && body.alt_text.length > 255) {
      return NextResponse.json(
        { message: 'Alt text must be less than 255 characters' },
        { status: 400 },
      );
    }

    const { data: newBanner, error } = await supabase
      .from('banners')
      .insert({
        image_url: body.image_url,
        alt_text: body.alt_text || null,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    return NextResponse.json(
      { message: 'Banner created successfully', data: newBanner },
      { status: 201 },
    );
  } catch (error: unknown) {
    console.error('Error creating banner:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    // Manual validation
    if (!body.id) {
      return NextResponse.json(
        { message: 'Banner ID is required' },
        { status: 400 },
      );
    }
    if (!body.image_url || !body.image_url.trim()) {
      return NextResponse.json(
        { message: 'Image URL is required' },
        { status: 400 },
      );
    }
    if (body.alt_text && body.alt_text.length > 255) {
      return NextResponse.json(
        { message: 'Alt text must be less than 255 characters' },
        { status: 400 },
      );
    }

    const { data: updatedBanner, error } = await supabase
      .from('banners')
      .update({
        image_url: body.image_url,
        alt_text: body.alt_text || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', body.id)
      .select()
      .single();

    if (error) throw new Error(error.message);

    return NextResponse.json(
      { message: 'Banner updated successfully', data: updatedBanner },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error('Error updating banner:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { message: 'Banner ID is required' },
        { status: 400 },
      );
    }

    const { error } = await supabase
      .from('banners')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);

    return NextResponse.json(
      { message: 'Banner deleted successfully' },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error('Error deleting banner:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 },
    );
  }
}