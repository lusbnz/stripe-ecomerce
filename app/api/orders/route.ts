import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';

export async function GET() {
  try {
    const [orders] = await pool.query<RowDataPacket[]>(`
      SELECT o.id, o.amount, o.customer_id, u.name AS customer_name,
             o.payment_method, o.description, o.address_id,
             o.shipping_details, o.status, o.created_at, o.updated_at
      FROM \`Order\` o
      JOIN User u ON o.customer_id = u.id
    `);
    return NextResponse.json(orders);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const {
    amount,
    customer_id,
    full_address,
    street,
    district,
    region,
    city,
    products
  } = await req.json();

  if (
    !amount ||
    !customer_id ||
    !full_address ||
    !street ||
    !district ||
    !region ||
    !city ||
    !Array.isArray(products) ||
    products.length === 0
  ) {
    return NextResponse.json({ error: 'Missing required fields or products' }, { status: 400 });
  }

  try {
    const [addressResult] = await pool.query<ResultSetHeader>(
      `INSERT INTO Address (full_address, street, district, region, city)
       VALUES (?, ?, ?, ?, ?)`,
      [full_address, street, district, region, city]
    );

    const address_id = addressResult.insertId;

    const [orderResult] = await pool.query<ResultSetHeader>(
      `INSERT INTO \`Order\`
       (amount, customer_id, payment_method, address_id, status, created_at, updated_at)
       VALUES (?, ?, 'VNPAY', ?, 'PENDING', NOW(), NOW())`,
      [amount, customer_id, address_id]
    );

    const order_id = orderResult.insertId;

    const [orderRows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM \`Order\` WHERE id = ?`,
      [order_id]
    );

    return NextResponse.json(orderRows[0], { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
