import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.pathname.split('/').pop();

  try {
    const [order] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM \`Order\` WHERE id = ?`,
      [id]
    );

    if (order.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json(order[0]);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.pathname.split('/').pop();
  const {
    amount, payment_method, description,
    address_id, shipping_details, status
  } = await req.json();

  try {
    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE \`Order\`
       SET amount = ?, payment_method = ?, description = ?, address_id = ?,
           shipping_details = ?, status = ?, updated_at = NOW()
       WHERE id = ?`,
      [amount, payment_method, description, address_id, shipping_details, status, id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const [updated] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM \`Order\` WHERE id = ?`,
      [id]
    );

    return NextResponse.json(updated[0]);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.pathname.split('/').pop();

  try {
    const [result] = await pool.query<ResultSetHeader>(
      `DELETE FROM \`Order\` WHERE id = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Order deleted successfully' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
