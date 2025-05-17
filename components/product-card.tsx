import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import Image from "next/image";
import { Button } from "./ui/button";
import { formatNumber } from "@/lib/common";
import { Product } from "@/app/admin/products/page";

interface Props {
  product: Product;
  index: number;
}

export const ProductCard = ({ product, index }: Props) => {
  return (
    <Link href={`/products/${product.id}`} className="block h-full">
      <Card className="group hover:shadow-2xl transition duration-300 py-0 h-full flex flex-col border-gray-300 gap-0">
        {product.image && (
          <div className="relative h-60 w-full">
            <Image
              src={product.image}
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
          {product.pricing && (
            <p className="text-lg font-semibold text-gray-900">
              {formatNumber(product.pricing)} VNĐ
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
