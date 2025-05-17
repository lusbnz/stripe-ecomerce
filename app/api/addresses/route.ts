import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import type { ResultSetHeader } from 'mysql2';

export async function GET() {
  try {
    const [rows] = await pool.query('SELECT * FROM Address');
    return NextResponse.json(rows);
  } catch (error: unknown) {
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
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO Address (full_address, street, district, region, city) VALUES (?, ?, ?, ?, ?)',
      [full_address, street || "", district || '', region || '', city]
    );
    const insertId = result.insertId;
    return NextResponse.json({ id: insertId, message: 'Address created' }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
