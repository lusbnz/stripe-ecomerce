"use client";

import Stripe from "stripe";
import Image from "next/image";
import { Button } from "./ui/button";
import { useCartStore } from "@/store/cart-store";
import { formatNumber } from "@/lib/common";
import { useState, useEffect } from "react";
import { Badge } from "./ui/badge";

interface Props {
  product: Stripe.Product;
}

export const ProductDetail = ({ product }: Props) => {
  const { addItem, items } = useCartStore();
  const price = product.default_price as Stripe.Price;
  const maxQuantity = parseInt(product.metadata?.Quantity || "1");
  const [localQuantity, setLocalQuantity] = useState(1);
  const [remainingQuantity, setRemainingQuantity] = useState(maxQuantity);

  const calculateRemainingQuantity = () => {
    const itemInCart = items.find((item) => item.id === product.id);
    const quantityInCart = itemInCart ? itemInCart.quantity : 0;
    setRemainingQuantity(maxQuantity - quantityInCart);
  };

  useEffect(() => {
    calculateRemainingQuantity();
  }, [items, maxQuantity]);

  const handleAddToCart = () => {
    if (localQuantity > 0 && localQuantity <= remainingQuantity) {
      addItem({
        id: product.id,
        name: product.name,
        price: price.unit_amount as number,
        imageUrl: product.images ? product.images[0] : null,
        quantity: localQuantity,
      });

      setRemainingQuantity((prev) => prev - localQuantity);
      setLocalQuantity(1);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row gap-8 items-center">
      {product.images && product.images[0] && (
        <div className="relative h-96 w-full md:w-1/2 rounded-lg overflow-hidden">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            loading="lazy"
            objectFit="cover"
            className="transition duration-300 hover:opacity-90"
          />
        </div>
      )}
      <div className="md:w-1/2">
        <h1 className="text-3xl font-bold mb-4">{product.name}</h1>

        <div className="flex flex-wrap items-center gap-2 mb-4">
          {product.metadata?.Color && (
            <Badge className="cursor-pointer p-2 text-[15px]" variant="outline">
              Color: {product.metadata.Color}
            </Badge>
          )}
          {product.metadata?.Category && (
            <Badge
              className="cursor-pointer p-2 text-[15px]"
              variant="secondary"
            >
              Category: {product.metadata.Category}
            </Badge>
          )}
        </div>

        {product.metadata?.Description ? (
          <div
            className="prose prose-sm sm:prose lg:prose-lg mb-4 text-gray-700"
            dangerouslySetInnerHTML={{
              __html: product.metadata.Description,
            }}
          />
        ) : (
          product.description && (
            <p className="text-gray-700 mb-4">{product.description}</p>
          )
        )}

        {price && price.unit_amount && (
          <p className="text-lg font-semibold text-gray-900">
            {formatNumber(price.unit_amount)} VNĐ
          </p>
        )}

        <p className="text-sm text-gray-500 mt-2">
          Có sẵn: {remainingQuantity} sản phẩm
        </p>

        <div className="flex items-center space-x-4 mt-4">
          <Button
            variant="outline"
            onClick={() => setLocalQuantity((prev) => Math.max(1, prev - 1))}
          >
            –
          </Button>
          <span className="text-lg font-semibold">{localQuantity}</span>
          <Button
            variant="outline"
            onClick={() =>
              setLocalQuantity((prev) =>
                prev < remainingQuantity ? prev + 1 : prev
              )
            }
          >
            +
          </Button>
        </div>

        <Button
          className="mt-4"
          disabled={localQuantity > remainingQuantity}
          onClick={handleAddToCart}
        >
          {localQuantity > remainingQuantity
            ? `Không thể mua quá ${remainingQuantity}`
            : "Add to Cart"}
        </Button>
      </div>
    </div>
  );
};
