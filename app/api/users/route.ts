import { NextRequest, NextResponse } from 'next/server';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import pool from '@/lib/db';

export async function GET() {
  try {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM User');
    return NextResponse.json(rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Fetched user failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { name, email, password, address_id, role } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO User (name, email, password, address_id, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, password, address_id, role || 'CUSTOMER']
    );
    const insertId = result.insertId;
    return NextResponse.json({ id: insertId, message: 'User created' }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Created user failed" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: 'Missing email or password' }, { status: 400 });
  }

  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM User WHERE email = ? AND password = ?',
      [email, password]
    );

    const user = rows[0];

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    return NextResponse.json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}