import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import Stripe from "stripe";
import nodemailer from "nodemailer";

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("stripe-signature") as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error("❌ Invalid signature", err);
    return new NextResponse("Invalid signature", { status: 400 });
  }

  console.log("✅ Webhook event:", event.type);

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

    const lineItems = await stripe.checkout.sessions.listLineItems(session.id);

    for (const item of lineItems.data) {
      const productId = item?.price?.product ? (item.price.product as string) : null;

      if (!productId) {
        console.log("❌ Không có thông tin sản phẩm. Bỏ qua item.");
        continue;
      }

      const quantityPurchased = item.quantity ?? 1;
      const product = await stripe.products.retrieve(productId);
      const currentQuantity = parseInt(product.metadata.Quantity || "0");

      if (currentQuantity > 0) {
        const updatedQuantity = currentQuantity - quantityPurchased;

        await stripe.products.update(productId, {
          metadata: {
            Quantity: String(updatedQuantity),
          },
        });

        console.log(
          `✅ Đã trừ ${quantityPurchased} sản phẩm khỏi kho, tồn kho còn: ${updatedQuantity}`
        );
      } else {
        console.log(`❌ Tồn kho không đủ cho sản phẩm ${productId}`);
      }
    }
  }

  return new NextResponse("Webhook received", { status: 200 });
}

async function sendMail(to: string, subject: string, text: string) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
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
