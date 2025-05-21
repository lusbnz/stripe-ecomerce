"use client";

import { useEffect, useState, useRef } from "react";
import { AISupportAgent } from "@/components/ai-support-agent";
import { ProductList } from "@/components/product-list";
import { Skeleton } from "@/components/ui/skeleton";
import { Product } from "../admin/products/page";
import FeedbackButton from "@/components/feedback-box";

const LIMIT = 10;

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const loader = useRef(null);
  function fetchFeatureProducts() {
    setIsLoading(true);
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data || []);
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
      })
      .finally(() => {
        setIsLoading(false);
        setHasMore(false);
      });
  }

  useEffect(() => {
    fetchFeatureProducts();
  }, []);

  return (
    <>
      <div className="pb-8">
        <h1 className="text-3xl font-bold text-center mb-8">All Products</h1>

        <ProductList products={products} isDetail={false} />

        {isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
            {Array.from({ length: LIMIT }).map((_, i) => (
              <div key={i} className="p-4 border rounded-lg shadow">
                <Skeleton className="h-48 w-full mb-4" />
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        )}

        {hasMore && <div ref={loader} className="h-10 mt-10" />}
        {!hasMore && (
          <p className="text-center text-muted-foreground mt-4">
            No more products.
          </p>
        )}
      </div>

      <AISupportAgent products={products} />
      <FeedbackButton />
    </>
  );
}
