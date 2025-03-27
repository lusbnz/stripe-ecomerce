"use client";

import Stripe from "stripe";
import { useEffect, useState } from "react";
import { ProductCard } from "./product-card";

interface Props {
  products: Stripe.Product[];
}

export const Carousel = ({ products }: Props) => {
  const [current, setCurrent] = useState<number>(0);
  const itemsToShow = 3;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + itemsToShow) % products.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [products.length]);

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
      {visibleProducts.map((product, index) => {
        return (
          <div key={index} className="flex-1">
            <ProductCard product={product} />
          </div>
        );
      })}
    </div>
  );
};
