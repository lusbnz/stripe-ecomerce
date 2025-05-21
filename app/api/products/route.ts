import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const featured = url.searchParams.get("featured");

  try {
    let query = supabase
      .from('products')
      .select('*, categories(name)')
      .order('created_at', { ascending: false });

    if (featured === "1") {
      query = query.limit(5);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Map data to include category_name
    const formattedData = data.map((item) => ({
      ...item,
      category_name: item.categories?.name || "Uncategorized",
      categories: undefined,
    }));

    return NextResponse.json(formattedData);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { name, description, pricing, image, quantity, color, category_id } = await req.json();

  if (!name || !pricing || !category_id) {
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
          category_id,
        },
      ])
      .select('*, categories(name)')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const formattedData = {
      ...data,
      category_name: data.categories?.name || "Uncategorized",
      categories: undefined,
    };

    return NextResponse.json(formattedData, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}