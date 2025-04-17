import { stripe } from "@/lib/stripe";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const limit = parseInt(searchParams.get("limit") || "10");
  const starting_after = searchParams.get("starting_after") || undefined;

  const products = await stripe.products.list({
    limit,
    expand: ["data.default_price"],
    ...(starting_after ? { starting_after } : {}),
  });

  return NextResponse.json({
    data: products.data,
    has_more: products.has_more,
  });
}
