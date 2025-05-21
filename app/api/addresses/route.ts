import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('user_id');

    if (!userId || isNaN(Number(userId))) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 },
      );
    }

    const { data: addresses, error } = await supabase
      .from('user_addresses')
      .select('addresses(id, full_address, street, district, region, city)')
      .eq('user_id', userId);

    if (error) throw error;

    return NextResponse.json({
      data: addresses.map((item) => item.addresses) || [],
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching addresses:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId, full_address, street, district, region, city } = await req.json();

    // Manual validation
    if (!userId || isNaN(Number(userId))) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 },
      );
    }
    if (
      !full_address?.trim() ||
      !street?.trim() ||
      !district?.trim() ||
      !region?.trim() ||
      !city?.trim()
    ) {
      return NextResponse.json(
        { error: 'All address fields are required' },
        { status: 400 },
      );
    }

    // Check if user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 },
      );
    }

    // Insert new address
    const { data: newAddress, error: addressError } = await supabase
      .from('addresses')
      .insert({
        full_address,
        street,
        district,
        region,
        city,
      })
      .select()
      .single();

    if (addressError || !newAddress) {
      console.error('Address insert error:', addressError?.message || 'No data returned');
      return NextResponse.json(
        { error: 'Failed to create address' },
        { status: 500 },
      );
    }

    // Link address to user
    const { error: linkError } = await supabase
      .from('user_addresses')
      .insert({
        user_id: userId,
        address_id: newAddress.id,
      });

    if (linkError) {
      console.error('User address link error:', linkError.message);
      return NextResponse.json(
        { error: 'Failed to link address to user' },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { message: 'Address saved successfully', address: newAddress },
      { status: 201 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error saving address:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.pathname.split('/').pop();
  const { full_address, street, district, region, city } = await req.json();

  if (!full_address || !city) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  if (!id) {
    return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
  }

  try {
    const { data, error } = await supabase
      .from('addresses')
      .update({
        full_address,
        street: street || '',
        district: district || '',
        region: region || '',
        city,
      })
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Address updated', address: data });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error updating address:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.pathname.split('/').pop();

  if (!id) {
    return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
  }

  try {
    const { error, count } = await supabase
      .from('addresses')
      .delete()
      .eq('id', id)
      .select();

    if (error) throw error;

    if (count === 0) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }

    await supabase
      .from('user_addresses')
      .delete()
      .eq('address_id', id);

    return NextResponse.json({ message: 'Address deleted' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error deleting address:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}