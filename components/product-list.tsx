"use client";

import Stripe from "stripe";
import { ProductCard } from "./product-card";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  products: Stripe.Product[];
  isDetail: boolean;
}

const COLORS = ["All", "Brown", "White", "Black", "Gray", "Blue"];
const CATEGORIES = ["All", "Keyboard", "Key Caps", "Mouse", "Accessories"];

export const ProductList = ({ products, isDetail = false }: Props) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("All");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const getColorFromMetadata = (product: Stripe.Product): string => {
    return product.metadata?.Color || product.metadata?.color || "";
  };

  const getCategoryFromMetadata = (product: Stripe.Product): string => {
    return product.metadata?.Category || product.metadata?.category || "";
  };

  const filteredProduct = products.filter((product) => {
    const term = searchTerm.toLowerCase();
    const nameMatch = product.name.toLowerCase().includes(term);
    const descriptionMatch = product.description
      ? product.description.toLowerCase().includes(term)
      : false;

    const color = getColorFromMetadata(product).toLowerCase();
    const category = getCategoryFromMetadata(product).toLowerCase();

    const colorMatch =
      selectedColor === "All" || color === selectedColor.toLowerCase();
    const categoryMatch =
      selectedCategory === "All" || category === selectedCategory.toLowerCase();

    return (
      (nameMatch || descriptionMatch || color.includes(term)) &&
      colorMatch &&
      categoryMatch
    );
  });

  return (
    <div className="px-4">
      {!isDetail && (
        <div className="mb-6 flex flex-col items-center gap-4 sm:flex-row sm:justify-center flex-wrap">
          <div className="w-full max-w-md">
            <Label htmlFor="search" className="sr-only">
              Search products
            </Label>
            <Input
              id="search"
              type="text"
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearchTerm(e.target.value)
              }
              placeholder="Search by name, description, color or category..."
            />
          </div>

          <Select onValueChange={setSelectedColor} defaultValue="All">
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue placeholder="Filter by color" />
            </SelectTrigger>
            <SelectContent>
              {COLORS.map((color) => (
                <SelectItem key={color} value={color}>
                  {color}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select onValueChange={setSelectedCategory} defaultValue="All">
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredProduct.map((product) => (
          <li key={product.id}>
            <ProductCard product={product} />
          </li>
        ))}
      </ul>
    </div>
  );
};
