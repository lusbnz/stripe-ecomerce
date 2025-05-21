"use client";
import { useIsMobile } from "@/hooks/use-mobile";
import Link from "next/link";
import { usePathname } from "next/navigation";

const adminLinks = [
  { href: "/", label: "Home" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/category", label: "Category" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/feedback", label: "Feedback" },
  { href: "/admin/banners", label: "Banners" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isMobile = useIsMobile();

  return (
    <div className="flex h-screen flex-col md:flex-row">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <aside className="w-64 bg-gray-100 p-4 h-full">
          <h2 className="text-lg font-bold mb-4">Admin Panel</h2>
          <nav className="space-y-2">
            {adminLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-3 py-2 rounded ${
                  pathname === link.href
                    ? "bg-blue-500 text-white"
                    : "hover:bg-gray-200"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </aside>
      )}

      {/* Mobile Top Nav */}
      {isMobile && (
        <nav className="flex gap-2 px-4 py-2 bg-gray-100 overflow-x-auto">
          {adminLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-2 rounded whitespace-nowrap ${
                pathname === link.href
                  ? "bg-blue-500 text-white"
                  : "hover:bg-gray-200"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}

      {/* Main Content */}
      <main className="flex-1 p-4 overflow-auto">{children}</main>
    </div>
  );
}
