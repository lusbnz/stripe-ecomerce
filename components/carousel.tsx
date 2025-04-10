"use client";

import Stripe from "stripe";
import { useEffect, useState } from "react";
import { ProductCard } from "./product-card";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  products: Stripe.Product[];
}

export const Carousel = ({ products }: Props) => {
  const [current, setCurrent] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const itemsToShow = 3;

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    const interval = setInterval(() => {
      setCurrent((prev) => (prev + itemsToShow) % products.length);
    }, 3000);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [products.length]);

  if (isLoading) {
    return (
      <div className="flex flex-col md:flex-row gap-4">
        {Array.from({ length: itemsToShow }).map((_, i) => (
          <div key={i} className="flex-1 p-4 border rounded-lg shadow">
            <Skeleton className="h-48 w-full mb-4" />
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  const getVisibleProducts = () => {
    return [
      products[current % products.length],
      products[(current + 1) % products.length],
      products[(current + 2) % products.length],
    ];
  };

  const visibleProducts = getVisibleProducts();

  return (
    <div className="flex flex-col md:flex-row gap-4">
      {visibleProducts.map((product, index) => (
        <div key={index} className="flex-1">
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  );
};
