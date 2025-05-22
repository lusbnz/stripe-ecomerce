import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Configure NodeMailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', // Use Gmail SMTP (or your SMTP service)
  auth: {
    user: process.env.EMAIL_USER, // Your email (e.g., your.email@gmail.com)
    pass: process.env.EMAIL_PASS, // Your email password or app-specific password
  },
});

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Email không hợp lệ' }, { status: 400 });
    }

    // Simulate checking if email exists in database (replace with your DB logic)
    const userExists = true; // Example: await db.user.findOne({ email });
    if (!userExists) {
      return NextResponse.json({ error: 'Email không tồn tại' }, { status: 404 });
    }


    // Create reset link
    const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?email=${email}`;

    // Send email
    await transporter.sendMail({
      from: `"Your App" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Đặt lại mật khẩu',
      html: `
        <h2>Đặt lại mật khẩu</h2>
        <p>Nhấn vào liên kết sau để đặt lại mật khẩu của bạn:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>Liên kết này có hiệu lực trong 1 giờ.</p>
        <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
      `,
    });

    return NextResponse.json({ message: 'Liên kết đặt lại mật khẩu đã được gửi' }, { status: 200 });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Lỗi server. Vui lòng thử lại sau.' }, { status: 500 });
  }
}