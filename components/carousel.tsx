"use client";

import Stripe from "stripe";
import { Card, CardContent, CardTitle } from "./ui/card";
import { useEffect, useState } from "react";
import Image from "next/image";

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
    <div className="flex gap-4">
      {visibleProducts.map((product) => {
        const price = product?.default_price as Stripe.Price;
        return (
          <Card
            key={product.id}
            className="relative overflow-hidden rounded-lg shadow-md border-gray-300 w-1/3"
          >
            {product?.images && product.images[0] && (
              <div className="relative h-60 w-full">
                <Image
                  src={product?.images[0]}
                  alt={product?.name}
                  layout="fill"
                  objectFit="cover"
                  className="transition-opacity duration-500 ease-in-out"
                />
              </div>
            )}
            <CardContent className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50">
              <CardTitle className="text-2xl font-bold text-white mb-2">
                {product?.name}
              </CardTitle>
              {price && price.unit_amount && (
                <p className="text-lg text-white">
                  {price.unit_amount} VNĐ
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
