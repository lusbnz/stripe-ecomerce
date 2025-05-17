import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('addresses')
      .select('*');

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { full_address, street, district, region, city } = await req.json();

  if (!full_address || !city) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    const { data, error } = await supabase
      .from('addresses')
      .insert([
        {
          full_address,
          street: street || '',
          district: district || '',
          region: region || '',
          city,
        },
      ])
      .select('id')
      .single();

    if (error) throw error;

    return NextResponse.json({ id: data.id, message: 'Address created' }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
