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
import { Slider } from "./ui/slider";

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
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 3000000]);

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

    const price = (product.default_price as Stripe.Price)?.unit_amount || 0;
    const priceMatch = price >= priceRange[0] && price <= priceRange[1];

    return (
      (nameMatch || descriptionMatch || color.includes(term)) &&
      colorMatch &&
      categoryMatch &&
      priceMatch
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

      <div className="flex w-full justify-center">
        <div className="flex flex-col gap-3 w-full sm:w-[800px] bg-muted/50 p-4 rounded-xl shadow-sm border mb-6">
          <Label className="text-sm font-medium text-muted-foreground mb-1">
            Filter by Price (VNĐ)
          </Label>

          <Slider
            min={0}
            max={5000000}
            step={50000}
            value={priceRange}
            onValueChange={(newRange) =>
              setPriceRange(newRange as [number, number])
            }
            className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
          />

          <div className="flex justify-between text-sm font-semibold text-gray-700">
            <span>{priceRange[0].toLocaleString()}₫</span>
            <span>{priceRange[1].toLocaleString()}₫</span>
          </div>
        </div>
      </div>

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
