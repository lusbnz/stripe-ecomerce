"use client";

import { Carousel } from "@/components/carousel";
import { HeroCarousel } from "@/components/hero-carousel";
import React, { useEffect, useState } from "react";
import { Product } from "./admin/products/page";
import { Loader2 } from "lucide-react";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  function fetchFeatureProducts() {
    setIsLoading(true);
    fetch("/api/products?featured=1")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data || []);
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  useEffect(() => {
    fetchFeatureProducts();
  }, []);

  return (
    <div>
      <section className="rounded bg-neutral-100">
        <div className="mx-auto">
          <HeroCarousel />
        </div>
      </section>
      <section className="py-8">
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
          </>
        ) : (
          <Carousel products={products} />
        )}
      </section>
    </div>
  );
}
