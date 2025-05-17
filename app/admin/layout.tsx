"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const adminLinks = [
  { href: "/", label: "Home" },
  { href: "/admin/products", label: "Products" },
  // { href: "/admin/customers", label: "Customers" },
  { href: "/admin/orders", label: "Orders" },
  // { href: "/admin/address", label: "Address" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen">
      <aside className="w-64 bg-gray-100 p-4">
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
      <main className="flex-1 p-6 overflow-auto">{children}</main>
    </div>
  );
}
