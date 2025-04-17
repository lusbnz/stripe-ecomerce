"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCartStore } from "@/store/cart-store";
import { checkoutAction } from "./checkout-action";
import { formatNumber } from "@/lib/common";
import Image from "next/image";

function CheckoutPageContent() {
  const { items, removeItem, addItem, removeItemById } = useCartStore();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const searchParams = useSearchParams();

  useEffect(() => {
    const ids = searchParams.get("ids");
    if (ids) {
      const idArray = ids.split(",");
      idArray.forEach((id) => {
        removeItemById(id);
      });
    }
  }, [searchParams, removeItemById]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  const selectedItems = items.filter((item) => selectedIds.includes(item.id));
  const total = selectedItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Checkout</h1>
      <Card className="max-w-md lg:max-w-xl mx-auto mb-8">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Order Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            {items.map((item) => (
              <li key={item.id} className="flex flex-col gap-2 border-b pb-2">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-3 items-start">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(item.id)}
                      onChange={() => toggleSelect(item.id)}
                      className="mt-1 cursor-pointer"
                    />
                    <Image
                      src={item.imageUrl as string}
                      alt={item.name}
                      loading="lazy"
                      width={64}
                      height={64}
                      className="object-cover rounded-md"
                    />
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatNumber(item.price)} VNĐ x {item.quantity}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="font-semibold">
                      {formatNumber(item.price * item.quantity)} VNĐ
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItemById(item.id)}
                      className="text-red-500 hover:text-red-600 cursor-pointer"
                    >
                      Delete
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="cursor-pointer"
                    onClick={() => removeItem(item.id)}
                  >
                    –
                  </Button>
                  <span className="text-lg font-semibold">{item.quantity}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="cursor-pointer"
                    onClick={() => addItem({ ...item, quantity: 1 })}
                  >
                    +
                  </Button>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-4 pt-2 text-lg font-semibold">
            Selected Total: {formatNumber(total)} VND
          </div>
        </CardContent>
      </Card>

      <form action={checkoutAction} className="max-w-md mx-auto">
        <input
          type="hidden"
          name="items"
          value={JSON.stringify(selectedItems)}
        />
        <Button
          type="submit"
          variant="default"
          className="w-full cursor-pointer"
          disabled={selectedItems.length === 0}
        >
          {selectedItems.length === 0
            ? "Select items to pay"
            : "Proceed to Payment"}
        </Button>
      </form>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CheckoutPageContent />
    </Suspense>
  );
}
