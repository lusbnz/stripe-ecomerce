import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.pathname.split('/').pop();
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM Product WHERE id = ?`,
      [id]
    );
    if (rows.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json(rows[0]);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.pathname.split('/').pop();
  const data = await req.json();

  const allowedFields = ['name', 'description', 'pricing', 'image', 'quantity', 'color', 'category'];
  const fieldsToUpdate = Object.entries(data)
    .filter(([key, value]) => allowedFields.includes(key) && value !== undefined);

  if (fieldsToUpdate.length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
  }

  const setClause = fieldsToUpdate.map(([key]) => `${key}=?`).join(', ');
  const values = fieldsToUpdate.map(([, value]) => value);

  try {
    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE Product SET ${setClause} WHERE id=?`,
      [...values, id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM Product WHERE id = ?', [id]);
    return NextResponse.json(rows[0], { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.pathname.split('/').pop();

  try {
    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM Product WHERE id=?',
      [id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Product deleted' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
