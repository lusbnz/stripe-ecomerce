"use client";

import { Product } from "@/app/admin/products/page";
import { ProductDetail } from "@/components/product-detail";
import { ProductList } from "@/components/product-list";
import { Skeleton } from "@/components/ui/skeleton";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function ProductPage() {
  const { id } = useParams();

  const [products, setProducts] = useState<Product | null>(null);
  // const [products, setProducts] = useState<Product>();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFeatureProducts = useCallback(() => {
    setIsLoading(true);
    fetch(`/api/products/${id}`)
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
  }, [id]);

  useEffect(() => {
    if (!id) return;
    fetchFeatureProducts();
  }, [fetchFeatureProducts]);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch products list");
        return res.json();
      })
      .then((data: Product[]) => setAllProducts(data))
      .catch((err) => console.error(err));
  }, []);

  const color = products?.color.toLowerCase() || "";
  const category = products?.category_name?.toLowerCase() || "";

  const similarProducts = allProducts.filter((p) => {
    if (p.id === products?.id) return false;

    const pColor = p?.color?.toLowerCase() || "";
    const pCategory = p?.category_name?.toLowerCase() || "";

    return (color && pColor === color) || (category && pCategory === category);
  });

  const plainSimilar = JSON.parse(JSON.stringify(similarProducts));

  return (
    <div className="space-y-12 px-4 min-h-[70vh]">
      {isLoading ? (
        <>
          <div className="p-8">
            <Skeleton className="h-8 w-1/3 mb-4" />
            <Skeleton className="h-64 w-full mb-4" />
            <Skeleton className="h-4 w-2/3 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </>
      ) : !!products ? (
        <>
          <ProductDetail product={products} />

          {plainSimilar.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-center text-foreground mb-6">
                Similar Products
              </h2>
              <ProductList
                products={plainSimilar?.slice(0, 3)}
                isDetail={true}
              />
            </div>
          )}
        </>
      ) : (
        <></>
      )}
    </div>
  );
}
