import Image from "next/image";
import { stripe } from "@/lib/stripe";
import { Carousel } from "@/components/carousel";
import Stripe from "stripe";

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
      <section className="rounded bg-neutral-100 ">
        <div className="mx-auto grid grid-cols-1 items-center justify-items-center gap-8">
          <Image
            alt="Hero Image"
            src={"/banner.webp"}
            loading="lazy"
            className="rounded"
            width={450}
            height={450}
            style={{
              width: "100%",
              height: "100%",
            }}
          />
        </div>
      </section>
      <section className="py-8">
        <Carousel products={filteredProducts} />
      </section>
    </div>
  );
}
