import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function PUT(req: NextRequest) {
  const { userId, currentPassword, newPassword } = await req.json();

  if (!userId || !currentPassword || !newPassword) {
    return NextResponse.json({ error: 'Thiếu thông tin yêu cầu' }, { status: 400 });
  }

  try {
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .eq('password', currentPassword)
      .maybeSingle();

    if (fetchError) {
      console.error(fetchError);
      return NextResponse.json({ error: 'Lỗi khi kiểm tra mật khẩu' }, { status: 500 });
    }

    if (!user) {
      return NextResponse.json({ error: 'Mật khẩu hiện tại không đúng' }, { status: 401 });
    }

    const { error: updateError } = await supabase
      .from('users')
      .update({ password: newPassword })
      .eq('id', userId);

    if (updateError) {
      console.error(updateError);
      return NextResponse.json({ error: 'Không thể cập nhật mật khẩu' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Đổi mật khẩu thành công' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
