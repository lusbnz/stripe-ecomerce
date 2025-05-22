import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { supabase } from '@/lib/supabase';
// Configure Supabase client

// Configure NodeMailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function POST(request: Request) {
  try {
    const {  password,email } = await request.json();
    console.log('Received password:', password);

 
   
    if (password.length < 8) {
      return NextResponse.json({ error: 'Mật khẩu phải có ít nhất 8 ký tự' }, { status: 400 });
    }

    console.log('Checking if email is valid:', email);
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email ) 
      .single();

    console.log('User found:', user);
    if (fetchError || !user ) {
      return NextResponse.json({ error: 'Token không hợp lệ hoặc đã hết hạn' }, { status: 400 });
    }

  
    const { error: updateError } = await supabase
      .from('users')
      .update({
        password: password,
      })
      .eq('email', user.email);

    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json({ error: 'Không thể cập nhật mật khẩu' }, { status: 500 });
    }

   
    await transporter.sendMail({
      from: `"Your App" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Mật khẩu đã được đặt lại',
      html: `
        <h2>Mật khẩu đã được đặt lại</h2>
        <p>Mật khẩu của bạn đã được cập nhật thành công.</p>
        <p>Nếu bạn không thực hiện hành động này, vui lòng liên hệ hỗ trợ ngay.</p>
        <a href="${process.env.NEXT_PUBLIC_BASE_URL}/sign-in">Đăng nhập ngay</a>
      `,
    });

    return NextResponse.json({ message: 'Mật khẩu đã được đặt lại thành công' }, { status: 200 });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Lỗi server. Vui lòng thử lại sau.' }, { status: 500 });
  }
}