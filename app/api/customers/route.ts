import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';

export async function GET() {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT c.id, c.name, c.email, c.role, c.created_at, 
              a.full_address, a.street, a.district, a.region, a.city
       FROM User c
       LEFT JOIN Address a ON c.address_id = a.id
       WHERE c.role = 'CUSTOMER'`
    );
    return NextResponse.json(rows);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { name, email } = await req.json();

  if (!name || !email) {
    return NextResponse.json({ error: 'Missing name or email' }, { status: 400 });
  }

  try {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO User (name, email, password, role, created_at)
       VALUES (?, ?, '12345678', 'CUSTOMER', NOW())`,
      [name, email]
    );

    const customerId = result.insertId;

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT c.id, c.name, c.email, c.role, c.created_at,
              a.full_address, a.street, a.district, a.region, a.city
       FROM User c
       LEFT JOIN Address a ON c.address_id = a.id
       WHERE c.id = ?`,
      [customerId]
    );

    return NextResponse.json(rows[0], { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}