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
import { Button } from "@/components/ui/button";

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
  const [showPriceFilter, setShowPriceFilter] = useState<boolean>(false);

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

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedColor("All");
    setSelectedCategory("All");
    setPriceRange([0, 3000000]);
    setShowPriceFilter(false);
  };

  const isFiltered =
    searchTerm !== "" ||
    selectedColor !== "All" ||
    selectedCategory !== "All" ||
    priceRange[0] !== 0 ||
    priceRange[1] !== 3000000;

  return (
    <div className="px-4">
      {!isDetail && (
        <div
          className={`mb-6 flex flex-col items-center gap-4 mx-auto flex-row justify-center flex-wrap transition-all duration-500 ease-in-out ${
            isFiltered ? "max-w-full" : "max-w-[1000px]"
          }`}
        >
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
              aria-label="Search products by name, description, color or category"
            />
          </div>

          <Select
            onValueChange={setSelectedColor}
            value={selectedColor}
            aria-label="Filter by color"
          >
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

          <Select
            onValueChange={setSelectedCategory}
            value={selectedCategory}
            aria-label="Filter by category"
          >
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

          <Button
            variant="outline"
            onClick={() => setShowPriceFilter((prev) => !prev)}
            className="w-full sm:w-auto"
            aria-label={
              showPriceFilter ? "Hide price filter" : "Show price filter"
            }
          >
            {showPriceFilter ? "Hide Price Filter" : "Show Price Filter"}
          </Button>

          <div
            className={`transition-all duration-500 opacity-${
              isFiltered ? "100" : "0"
            } transform ${isFiltered ? "translate-y-0" : "-translate-y-4"}`}
          >
            {isFiltered && (
              <Button
                variant="destructive"
                onClick={handleClearFilters}
                className="w-full sm:w-auto"
                aria-label="Clear all filters"
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>
      )}

      <div
        className={`flex w-full justify-center transition-all duration-500 ease-in-out ${
          showPriceFilter
            ? "max-h-[500px] opacity-100"
            : "max-h-0 opacity-0 overflow-hidden"
        }`}
      >
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
        {filteredProduct.map((product, index) => (
          <li key={product.id}>
            <ProductCard product={product} index={index} />
          </li>
        ))}
      </ul>
    </div>
  );
};
