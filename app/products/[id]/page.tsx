import { ProductDetail } from "@/components/product-detail";
import { ProductList } from "@/components/product-list";
import { stripe } from "@/lib/stripe";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const product = await stripe.products.retrieve(id, {
    expand: ["default_price"],
  });

  const allProducts = await stripe.products.list({
    expand: ["data.default_price"],
  });

  const color = product.metadata?.Color?.toLowerCase() || "";
  const category = product.metadata?.Category?.toLowerCase() || "";

  const similarProducts = allProducts.data.filter((p) => {
    if (p.id === product.id) return false;

    const pColor = p.metadata?.Color?.toLowerCase() || "";
    const pCategory = p.metadata?.Category?.toLowerCase() || "";

    return (color && pColor === color) || (category && pCategory === category);
  });

  const plainProduct = JSON.parse(JSON.stringify(product));
  const plainSimilar = JSON.parse(JSON.stringify(similarProducts));

  return (
    <div className="space-y-12 px-4 min-h-[70vh]">
      <ProductDetail product={plainProduct} />

      {plainSimilar.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-center text-foreground mb-6">
            Similar Products
          </h2>
          <ProductList products={plainSimilar} isDetail={true} />
        </div>
      )}
    </div>
  );
}
