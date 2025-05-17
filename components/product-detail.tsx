"use client";

import Image from "next/image";
import { Button } from "./ui/button";
import { formatNumber } from "@/lib/common";
import { useState, useEffect } from "react";
import { Badge } from "./ui/badge";
import { Product } from "@/app/admin/products/page";

interface Props {
  product?: Product;
}

export const ProductDetail = ({ product }: Props) => {
  const initialMax = product?.quantity || 0;
  const [localQuantity, setLocalQuantity] = useState(1);
  const [remainingQuantity, setRemainingQuantity] = useState(initialMax);

  useEffect(() => {
    if (!product) return;
    try {
      const stored = localStorage.getItem("cart");
      const cart = stored
        ? (JSON.parse(stored) as (Product & { quantity: number })[])
        : [];
      const item = cart.find((i) => i.id === product.id);
      const used = item ? item.quantity : 0;
      setRemainingQuantity(initialMax - used);
      setLocalQuantity((prev) => Math.min(prev, initialMax - used) || 1);
    } catch {
      setRemainingQuantity(initialMax);
    }
  }, [product, initialMax]);

  const handleAdd = () => {
    if (!product || localQuantity < 1 || localQuantity > remainingQuantity)
      return;
    try {
      const stored = localStorage.getItem("cart");
      let cart: (Product & { quantity: number })[] = [];
  
      try {
        const parsed = JSON.parse(stored || "[]");
        cart = Array.isArray(parsed) ? parsed : [];
      } catch {
        cart = [];
      }
  
      const index = cart.findIndex((i) => i.id === product.id);
      if (index >= 0) {
        cart[index].quantity += localQuantity;
      } else {
        cart.push({ ...product, quantity: localQuantity });
      }
  
      localStorage.setItem("cart", JSON.stringify(cart));
      setRemainingQuantity((prev) => prev - localQuantity);
      setLocalQuantity(1);
    } catch (e) {
      console.error("Failed to update cart", e);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row gap-8 items-center">
      {product?.image && (
        <div className="relative h-96 w-full md:w-1/2 rounded-lg overflow-hidden">
          <Image
            src={product.image}
            alt={product.name}
            fill
            loading="lazy"
            style={{ objectFit: "cover" }}
            className="transition duration-300 hover:opacity-90"
          />
        </div>
      )}
      <div className="md:w-1/2">
        <h1 className="text-3xl font-bold mb-4">{product?.name}</h1>

        <div className="flex flex-wrap items-center gap-2 mb-4">
          {product?.color && (
            <Badge className="cursor-pointer p-2 text-[15px]" variant="outline">
              Color: {product.color}
            </Badge>
          )}
          {product?.category && (
            <Badge
              className="cursor-pointer p-2 text-[15px]"
              variant="secondary"
            >
              Category: {product.category}
            </Badge>
          )}
        </div>

        {product?.description && (
          <div
            className="prose prose-sm sm:prose lg:prose-lg mb-4 text-gray-700"
            dangerouslySetInnerHTML={{ __html: product.description }}
          />
        )}

        {product && (
          <p className="text-lg font-semibold text-gray-900">
            {formatNumber(product.pricing)} VNĐ
          </p>
        )}

        <p className="text-sm text-gray-500 mt-2">
          Có sẵn: {remainingQuantity} sản phẩm
        </p>

        <div className="flex items-center space-x-4 mt-4">
          <Button
            variant="outline"
            onClick={() => setLocalQuantity((prev) => Math.max(1, prev - 1))}
            disabled={localQuantity <= 1}
          >
            –
          </Button>
          <span className="text-lg font-semibold">{localQuantity}</span>
          <Button
            variant="outline"
            onClick={() =>
              setLocalQuantity((prev) => Math.min(remainingQuantity, prev + 1))
            }
            disabled={localQuantity >= remainingQuantity}
          >
            +
          </Button>
        </div>

        <Button
          className="mt-4"
          disabled={localQuantity < 1 || localQuantity > remainingQuantity}
          onClick={handleAdd}
        >
          {localQuantity > remainingQuantity
            ? `Không thể mua quá ${remainingQuantity}`
            : "Add to Cart"}
        </Button>
      </div>
    </div>
  );
};
