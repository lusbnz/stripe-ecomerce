"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  AISupportAgent,
  ProductWithPrice,
} from "@/components/ai-support-agent";
import { ProductList } from "@/components/product-list";
import { Skeleton } from "@/components/ui/skeleton";
import Stripe from "stripe";

const LIMIT = 10;

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductWithPrice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const loader = useRef(null);
  const isFetchingRef = useRef(false);

  const fetchInitialProducts = useCallback(async () => {
    setIsLoading(true);
    const url = new URL("/api/products", window.location.origin);
    url.searchParams.set("limit", String(LIMIT));

    const res = await fetch(url.toString());
    const json = await res.json();

    const newProducts: (Stripe.Product & { default_price: Stripe.Price })[] =
      json.data;

    const filtered = newProducts.filter((product) => {
      const price = product.default_price as Stripe.Price;
      return (
        price && typeof price.unit_amount === "number" && price.unit_amount > 1
      );
    });

    setProducts(filtered);
    setHasMore(json.has_more);
    setIsLoading(false);
  }, []);

  const loadMoreProducts = useCallback(async () => {
    if (isFetchingRef.current || !hasMore || isLoading || !products.length)
      return;
    isFetchingRef.current = true;

    setIsLoading(true);
    const lastProductId = products[products.length - 1].id;
    const url = new URL("/api/products", window.location.origin);
    url.searchParams.set("limit", String(LIMIT));
    url.searchParams.set("starting_after", lastProductId);

    const res = await fetch(url.toString());
    const json = await res.json();
    const newProducts: (Stripe.Product & { default_price: Stripe.Price })[] =
      json.data;

    const filtered = newProducts.filter((product) => {
      const price = product.default_price as Stripe.Price;
      return (
        price && typeof price.unit_amount === "number" && price.unit_amount > 1
      );
    });

    setProducts((prev) => [...prev, ...filtered]);
    setHasMore(json.has_more);
    setIsLoading(false);
    isFetchingRef.current = false;
  }, [hasMore, isLoading, products]);

  useEffect(() => {
    fetchInitialProducts();
  }, [fetchInitialProducts]);

  useEffect(() => {
    if (!hasMore || isLoading || products.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreProducts();
        }
      },
      { threshold: 1 }
    );

    const currentLoader = loader.current;
    if (currentLoader) observer.observe(currentLoader);

    return () => {
      if (currentLoader) observer.unobserve(currentLoader);
    };
  }, [loadMoreProducts, hasMore, isLoading, products.length]);

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
    </>
  );
}
