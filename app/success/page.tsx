"use client";

import { useCartStore } from "@/store/cart-store";
import Link from "next/link";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function SuccessPage() {
  const { removeItemById } = useCartStore();
  const searchParams = useSearchParams();

  useEffect(() => {
    const ids = searchParams.get("ids");
    if (ids) {
      const idArray = ids.split(",");
      idArray.forEach((id) => removeItemById(id));
    }
  }, [searchParams, removeItemById]);

  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <h1 className="text-3xl font-bold mb-4">Payment Successful!</h1>
      <p className="mb-4">
        Thank you for your purchase. Your order is being processed.
      </p>
      <Link href="/products" className="text-blue-600 hover:underline">
        Continue Shopping
      </Link>
    </div>
  );
}
