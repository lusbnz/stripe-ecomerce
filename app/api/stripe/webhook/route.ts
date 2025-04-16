import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import nodemailer from "nodemailer";

// Stripe webhook secret từ .env
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: Request) {
  const body = await request.text();
  const allHeaders = await headers();
  const signature = allHeaders.get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("❌ Invalid signature", err);
    return new NextResponse("Invalid signature", { status: 400 });
  }

  // Xử lý event khi thanh toán hoàn tất
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const email = session.customer_details?.email;
    const amount = session.amount_total ? session.amount_total / 100 : 0;

    console.log("✅ Thanh toán hoàn tất bởi:", email);

    if (email) {
      await sendMail(
        email,
        "Cảm ơn bạn đã mua hàng!",
        `Bạn đã thanh toán ${amount.toLocaleString()} VND. Cảm ơn bạn rất nhiều!`
      );
    }
  }

  return new NextResponse("Webhook received", { status: 200 });
}

// ✅ Hàm gửi email bằng Nodemailer
async function sendMail(to: string, subject: string, text: string) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,   // Gmail của bạn
      pass: process.env.EMAIL_PASS,   // Mật khẩu ứng dụng (App Password)
    },
  });

  await transporter.sendMail({
    from: `"Shop Của Bạn" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
  });

  console.log(`📧 Đã gửi email xác nhận đến ${to}`);
}
