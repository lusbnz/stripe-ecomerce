"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export function LayoutWithNav({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const hideNavFooter = pathname === "/sign-in" || pathname === "/sign-up" || pathname === "/verify" || pathname === "/forgot-password" || pathname === "/reset-password" || pathname === "/admin/login";
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  if (hideNavFooter || isAdmin) {
    return (
      <>
        <main className="flex-grow container mx-auto px-4 py-8">
          {children}
        </main>
      </>
    );
  }

  return (
    <>
      {!hideNavFooter && <Navbar />}
      <main className="flex-grow container mx-auto px-4 py-8">{children}</main>
      {!hideNavFooter && <Footer />}
    </>
  );
}
