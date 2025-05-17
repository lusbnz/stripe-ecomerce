import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const featured = url.searchParams.get("featured");

  try {
    let query = supabase
      .from('products')
      .select('*');

    if (featured === "1") {
      query = query.order('created_at', { ascending: false }).limit(5);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { name, description, pricing, image, quantity, color, category } = await req.json();

  if (!name || !pricing) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .insert([
        {
          name,
          description: description || '',
          pricing,
          image: image || '',
          quantity,
          color,
          category
        }
      ])
      .select('*') 

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data?.[0], { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
