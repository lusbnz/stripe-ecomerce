import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";

export async function GET() {
  const products = await stripe.products.list({
    expand: ["data.default_price"],
  });

  return NextResponse.json(products.data);
}
