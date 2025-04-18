import Link from "next/link";
import Stripe from "stripe";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import Image from "next/image";
import { Button } from "./ui/button";
import { formatNumber } from "@/lib/common";

interface Props {
  product: Stripe.Product;
  index: number;
}

export const ProductCard = ({ product, index }: Props) => {
  const price = product.default_price as Stripe.Price;

  return (
    <Link href={`/products/${product.id}`} className="block h-full">
      <Card className="group hover:shadow-2xl transition duration-300 py-0 h-full flex flex-col border-gray-300 gap-0">
        {product.images && product.images[0] && (
          <div className="relative h-60 w-full">
            <Image
              src={product.images[0]}
              alt={product.name}
              priority={index <= 3}
             fill
              objectFit="cover"
              className="group-hover:opacity-90 transition-opacity duration-300 rounded-t-lg"
            />
          </div>
        )}
        <CardHeader className="p-4">
          <CardTitle className="text-xl font-bold text-gray-800">
            {product.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 flex-grow flex flex-col justify-between">
          {price && price.unit_amount && (
            <p className="text-lg font-semibold text-gray-900">
              {formatNumber(price.unit_amount)} VNĐ
            </p>
          )}
          <div className="flex gap-2">
            <Button className="mt-4 bg-black text-white flex-1">View Details</Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
