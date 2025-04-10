"use server";

import { stripe } from "@/lib/stripe";
import { CartItem } from "@/store/cart-store";
import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server"; 

export const checkoutAction = async (formData: FormData): Promise<void> => {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
    return;
  }

  const itemsJson = formData.get("items") as string;
  const items = JSON.parse(itemsJson);
  const line_items = items.map((item: CartItem) => ({
    price_data: {
      currency: "vnd",
      product_data: { name: item.name },
      unit_amount: item.price,
    },
    quantity: item.quantity,
  }));

  const stripeSession = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items,
    mode: "payment",
    shipping_address_collection: {
      allowed_countries: ["VN", "US"], 
    },
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout`,
  });

  redirect(stripeSession.url!);
};