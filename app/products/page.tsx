"use client";

import { useEffect, useState } from "react";
import {
  AISupportAgent,
  ProductWithPrice,
} from "@/components/ai-support-agent";
import { ProductList } from "@/components/product-list";
import { Skeleton } from "@/components/ui/skeleton";
import Stripe from "stripe";

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductWithPrice[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetch("/api/products")
        .then((res) => res.json())
        .then((data) => {
          const filtered = data.filter(
            (product: Stripe.Product & { default_price: Stripe.Price }) => {
              const price = product.default_price as Stripe.Price;
              return price && typeof price.unit_amount === "number";
            }
          );
          setProducts(filtered);
          setIsLoading(false);
        });
    }, 500);

    return () => clearTimeout(timeout);
  }, []);

  if (isLoading || !products) {
    return (
      <div className="pb-8">
        <h1 className="text-3xl font-bold leading-none tracking-tight text-foreground text-center mb-8">
          All Products
        </h1>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="p-4 border rounded-lg shadow">
              <Skeleton className="h-48 w-full mb-4" />
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="pb-8">
        <h1 className="text-3xl font-bold leading-none tracking-tight text-foreground text-center mb-8">
          All Products
        </h1>
        <ProductList products={products} isDetail={false} />
      </div>
      <AISupportAgent products={products} />
    </>
  );
}
