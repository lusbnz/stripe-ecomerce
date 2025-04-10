import Image from "next/image";
import { stripe } from "@/lib/stripe";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Carousel } from "@/components/carousel";

export default async function Home() {
  const products = await stripe.products.list({
    expand: ["data.default_price"],
    limit: 5,
  });

  return (
    <div>
      <section className="rounded bg-neutral-100 ">
        <div className="mx-auto grid grid-cols-1 items-center justify-items-center gap-8">
          {/* <div className="max-w-md space-y-4 py-8 sm:py-12 pl-8 sm:pl-16">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Welcome
            </h2>
            <p className="text-neutral-600">
              Discover the latest products at the best prices.
            </p>
            <Button
              asChild
              variant="default"
              className="inline-flex items-center justify-center rounded-full px-6 py-3 bg-black text-white"
            >
              <Link
                href="/products"
                className="inline-flex items-center justify-center rounded-full px-6 py-3"
              >
                Browse All Products
              </Link>
            </Button>
          </div> */}
          <Image
            alt="Hero Image"
            src={"https://www.lofree.co/cdn/shop/files/Banner-PC_1f1a8545-b21d-4fc0-bb18-bbe87a08cd16.png?v=1741175643&width=2000"}
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
        <Carousel products={products.data} />
      </section>
    </div>
  );
}
