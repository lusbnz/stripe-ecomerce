import { Separator } from "@/components/ui/separator";
import { Facebook } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-white border-t mt-12">
      <Separator />
      <div className="container mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-8 text-sm text-muted-foreground">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-900">MyStore</h2>
          <p>Buy cool products that make you stand out.</p>
        </div>

        <div className="flex gap-4 justify-center items-center">
          <Link href="/" className="hover:underline">
            Home
          </Link>
          <Link href="/products" className="hover:underline">
            Products
          </Link>
          <Link href="/checkout" className="hover:underline">
            Cart
          </Link>
        </div>

        <div className="flex flex-col md:items-end space-y-4">
          <p className="font-medium">Follow us</p>
          <div className="flex gap-4">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Facebook className="h-5 w-5 hover:text-black transition-colors" />
            </a>
          </div>
        </div>
      </div>

      <Separator className="my-4" />
      <div className="text-center text-xs text-muted-foreground pb-6">
        &copy; {new Date().getFullYear()} MyStore. All rights reserved.
      </div>
    </footer>
  );
}
