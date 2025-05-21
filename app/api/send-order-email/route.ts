import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { supabase } from '@/lib/supabase';
import { formatNumber } from '@/lib/common'; // Assuming you have this utility

// Configure nodemailer (reuse same config)
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

interface OrderEmailPayload {
  userId: string;
  orderCode: string;
  totalAmount: number;
  products: Array<{
    id: number;
    name: string;
    pricing: number;
    quantity: number;
  }>;
  address: {
    full_address: string;
    street: string;
    district: string;
    region: string;
    city: string;
  };
}

export async function POST(req: NextRequest) {
  try {
    const { userId, orderCode, totalAmount, products, address } = await req.json() as OrderEmailPayload;

    // Validate input
    if (!userId || !orderCode || !totalAmount || !products?.length || !address) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Fetch user email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('email, name')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Generate email content
    const productList = products.map(product => `
      <li>
        <strong>${product.name}</strong>: ${formatNumber(product.pricing)} VNĐ x ${product.quantity} = ${formatNumber(product.pricing * product.quantity)} VNĐ
      </li>
    `).join('');

    const emailHtml = `
      <h1>Xác nhận đơn hàng #${orderCode}</h1>
      <p>Xin chào ${user.name},</p>
      <p>Cảm ơn bạn đã đặt hàng! Dưới đây là chi tiết đơn hàng của bạn:</p>
      <ul>${productList}</ul>
      <p><strong>Tổng cộng:</strong> ${formatNumber(totalAmount)} VNĐ</p>
      <h3>Địa chỉ giao hàng:</h3>
      <p>${address.full_address}, ${address.street}, ${address.district}, ${address.region}, ${address.city}</p>
      <p>Chúng tôi sẽ thông báo khi đơn hàng được xử lý.</p>
      <p>Trân trọng,<br/>Quốc Việt</p>
    `;

    // Send email
    await transporter.sendMail({
      from: '"Quốc Việt" <tslcvnm@gmail.com>',
      to: user.email,
      subject: `Xác nhận đơn hàng #${orderCode}`,
      html: emailHtml,
    });

    console.log(`Order confirmation email sent to ${user.email}`);
    return NextResponse.json({ message: 'Order confirmation email sent' }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error sending order confirmation email:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}