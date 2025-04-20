"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { Button } from "./ui/button";
import { CartItem, useCartStore } from "@/store/cart-store";

type Address = {
  line1: string;
  line2?: string | null;
  city: string;
  state?: string | null;
  postal_code?: string | null;
  country: string;
};

interface Item {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

interface ApiTransaction {
  id: string;
  created: number;
  amount_total: number;
  currency: string;
  payment_status: string;
  mode: string;
  success_url: string;
  shipping_details: {
    address: Address;
    name: string;
    phone?: string | null;
    carrier?: string | null;
    tracking_number?: string | null;
  };
  customer_details: {
    email: string;
    name: string;
    phone?: string | null;
    address: Address;
    tax_exempt: string;
  };
  metadata: {
    items: string;
    userId: string;
  };
}

type Transaction = ApiTransaction & {
  items: Item[];
};

export default function TransactionHistory() {
  const { addItem } = useCartStore();
  const [transactions, setTransactions] = useState<Transaction[] | null>(null);

  useEffect(() => {
    async function fetchTransactions() {
      const res = await fetch("/api/transactions");
      if (!res.ok) {
        console.error("Failed to fetch transactions");
        return;
      }
      const { transactions: apiTxs }: { transactions: ApiTransaction[] } =
        await res.json();
      const parsed = apiTxs.map((tx) => ({
        ...tx,
        items: JSON.parse(tx.metadata.items) as Item[],
      }));
      setTransactions(parsed);
    }
    fetchTransactions();
  }, []);

  if (!transactions) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-80 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {transactions.map((tx) => (
        <Card key={tx.id} className="border shadow-sm hover:shadow-xl">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span
                className="block truncate max-w-sm"
                title={`Order #${tx.id}`}
              >
                Order #{tx.id}
              </span>
              <Badge
                variant={tx.payment_status === "paid" ? "secondary" : "outline"}
              >
                {tx.payment_status.toUpperCase()}
              </Badge>
            </CardTitle>
            <CardDescription>
              {new Date(tx.created * 1000).toLocaleString()}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <strong>Mode:</strong> {tx.mode}
              </div>
              <div>
                <strong>Total:</strong> {tx.amount_total.toLocaleString()}{" "}
                {tx.currency}
              </div>
            </div>

            {!!tx.customer_details && !!tx.shipping_details && <Separator />}

            {!!tx.customer_details && (
              <div>
                <strong>Customer:</strong> {tx.customer_details?.name} (
                {tx.customer_details?.email})
              </div>
            )}
            {!!tx.shipping_details && (
              <div>
                <strong>Shipping to:</strong>{" "}
                {`${tx.shipping_details?.address.line1}, ${
                  tx.shipping_details?.address.city
                }, ${tx.shipping_details?.address.state ?? ""}, ${
                  tx.shipping_details?.address.country
                }`}
              </div>
            )}

            <Separator />

            <div className="space-y-2">
              <strong>Items:</strong>
              {tx.items.map((item) => (
                <div key={item.id} className="flex items-center space-x-3">
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-10 h-10 rounded"
                    width={40}
                    height={40}
                  />
                  <div>
                    <div>{item.name}</div>
                    <div>
                      {item.quantity} × {item.price.toLocaleString()}{" "}
                      {tx.currency}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Separator />

            <div className="flex justify-end">
              <Button
                className="cursor-pointer"
                onClick={() => {
                  tx.items.forEach((item) => {
                    const cartItem: CartItem = {
                      id: item.id,
                      name: item.name,
                      price: item.price,
                      imageUrl: item.imageUrl,
                      quantity: item.quantity,
                    };
                    addItem(cartItem);
                  });
                }}
              >
                Mua lại
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
