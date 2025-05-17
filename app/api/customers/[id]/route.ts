import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.pathname.split('/').pop();

  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT c.id, c.name, c.email, c.role, c.created_at,
              a.full_address, a.street, a.district, a.region, a.city
       FROM User c
       LEFT JOIN Address a ON c.address_id = a.id
       WHERE c.id = ? AND c.role = 'CUSTOMER'`,
      [id]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.pathname.split('/').pop();
  const { name, email } = await req.json();

  if (!name || !email) {
    return NextResponse.json({ error: 'Missing name or email' }, { status: 400 });
  }

  try {
    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE User SET name = ?, email = ? WHERE id = ? AND role = 'CUSTOMER'`,
      [name, email, id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    const [updated] = await pool.query<RowDataPacket[]>(
      `SELECT c.id, c.name, c.email, c.role, c.created_at,
              a.full_address, a.street, a.district, a.region, a.city
       FROM User c
       LEFT JOIN Address a ON c.address_id = a.id
       WHERE c.id = ?`,
      [id]
    );

    return NextResponse.json(updated[0]);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.pathname.split('/').pop();

  try {
    const [custRows] = await pool.query<RowDataPacket[]>(
      'SELECT address_id FROM User WHERE id = ? AND role = "CUSTOMER"',
      [id]
    );

    if (custRows.length === 0) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    const addressId = custRows[0].address_id;

    await pool.query('DELETE FROM User WHERE id = ?', [id]);

    if (addressId) {
      await pool.query('DELETE FROM Address WHERE id = ?', [addressId]);
    }

    return NextResponse.json({ message: 'Customer deleted successfully' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}