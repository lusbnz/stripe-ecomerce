import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';

export async function PUT(req: NextRequest) {
  const { userId, currentPassword, newPassword } = await req.json();

  if (!userId || !currentPassword || !newPassword) {
    return NextResponse.json({ error: 'Thiếu thông tin yêu cầu' }, { status: 400 });
  }

  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM User WHERE id = ? AND password = ?',
      [userId, currentPassword]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Mật khẩu hiện tại không đúng' }, { status: 401 });
    }

    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE User SET password = ? WHERE id = ?',
      [newPassword, userId]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Không tìm thấy người dùng' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Đổi mật khẩu thành công' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
