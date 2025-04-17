import { stripe } from "@/lib/stripe";
import { Carousel } from "@/components/carousel";
import Stripe from "stripe";
import { HeroCarousel } from "@/components/hero-carousel";

export default async function Home() {
  const products = await stripe.products.list({
    expand: ["data.default_price"],
    limit: 5,
  });

  const filteredProducts = products.data.filter((product) => {
    const price = product.default_price as Stripe.Price;
    return price && typeof price.unit_amount === "number";
  });

  return (
    <div>
       <section className="rounded bg-neutral-100">
        <div className="mx-auto">
          <HeroCarousel />
        </div>
      </section>
      <section className="py-8">
        <Carousel products={filteredProducts} />
      </section>
    </div>
  );
}
