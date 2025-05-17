import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const featured = url.searchParams.get("featured");

  let sql: string;
  const params: (string | number)[] = [];

  if (featured === "1") {
    sql = "SELECT * FROM Product ORDER BY created_at DESC LIMIT 5";
  } else {
    sql = "SELECT * FROM Product";
  }

  try {
    const [rows] = await pool.query<RowDataPacket[]>(sql, params);
    return NextResponse.json(rows);
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
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO Product (name, description, pricing, image, quantity, color, category) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, description || '', pricing, image || '', quantity, color, category]
    );
    const insertId = result.insertId;
    
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM Product WHERE id = ?',
      [insertId]
    );
    
    return NextResponse.json(rows[0], { status: 201 });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
