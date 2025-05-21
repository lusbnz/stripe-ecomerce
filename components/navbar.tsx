"use client";

import Link from "next/link";
import {
  ShoppingCartIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback } from "./ui/avatar";

interface User {
  id: string;
  email: string;
  role: "CUSTOMER" | "ADMIN" | string;
}

export const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  // const [cartCount, setCartCount] = useState<number>(0);

  // useEffect(() => {
  //   const storedCart = localStorage.getItem("cart");
  //   if (storedCart) {
  //     try {
  //       const cartArray = JSON.parse(storedCart);
  //       if (Array.isArray(cartArray)) {
  //         setCartCount(cartArray.length);
  //       }
  //     } catch {
  //       setCartCount(0);
  //     }
  //   }

  //   const handleStorageChange = (event: StorageEvent) => {
  //     if (event.key === "cart" && event.newValue) {
  //       try {
  //         const cartArray = JSON.parse(event.newValue);
  //         if (Array.isArray(cartArray)) {
  //           setCartCount(cartArray.length);
  //         }
  //       } catch {
  //         setCartCount(0);
  //       }
  //     }
  //   };

  //   window.addEventListener("storage", handleStorageChange);

  //   return () => {
  //     window.removeEventListener("storage", handleStorageChange);
  //   };
  // }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem("ecom_user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser(null);
      }
    }

    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("ecom_user");
    localStorage.removeItem("ecom_token");
    setUser(null);
    window.location.href = "/sign-in";
  };

  const getInitial = (email: string) => {
    return email.charAt(0).toUpperCase();
  };

  return (
    <nav className="sticky top-0 z-50 bg-white shadow">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <Link href="/" className="hover:text-blue-600 font-bold cursor-pointer">
          Ecommerce
        </Link>
        <div className="hidden md:flex space-x-6 cursor-pointer">
          <Link href="/">Home</Link>
          <Link href="/about">About</Link>
          <Link href="/products" className="hover:text-blue-600 cursor-pointer">
            Products
          </Link>
          <Link href="/checkout" className="hover:text-blue-600 cursor-pointer">
            Checkout
          </Link>
          {/* <Link href="/transactions" className="hover:text-blue-600 cursor-pointer">
            Transactions
          </Link> */}
          {/* <Link href="/dashboard" className="hover:text-blue-600 cursor-pointer">
            Dashboard
          </Link> */}
          {user?.role === "ADMIN" && (
            <Link
              href="/admin/products"
              className="hover:text-blue-600 cursor-pointer"
            >
              Admin
            </Link>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <Link href="/checkout" className="relative">
            <ShoppingCartIcon className="h-6 w-6" />
            {/* {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                {cartCount}
              </span>
            )} */}
          </Link>
          {user?.email ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button aria-label="User menu" className="cursor-pointer">
                  <Avatar>
                    <AvatarFallback>{getInitial(user?.email)}</AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem className="cursor-default select-none">
                  {user?.email}
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-default select-none">
                  <Link href="/profile" className="relative">
                    Đổi mật khẩu
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-600"
                >
                  Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/sign-in">
              <Button variant="outline" className="cursor-pointer">
                Login
              </Button>
            </Link>
          )}
          <Button
            variant="ghost"
            className="md:hidden cursor-pointer"
            onClick={() => setMobileOpen((prev) => !prev)}
          >
            {mobileOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </Button>
        </div>
      </div>
      {mobileOpen && (
        <nav className="md:hidden bg-white shadow-md">
          <ul className="flex flex-col p-4 space-y-2">
            <li>
              <Link
                href="/"
                className="block hover:text-blue-600 cursor-pointer"
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                href="/about"
                className="block hover:text-blue-600 cursor-pointer"
              >
                About
              </Link>
            </li>
            <li>
              <Link
                href="/products"
                className="block hover:text-blue-600 cursor-pointer"
              >
                Products
              </Link>
            </li>
            <li>
              <Link
                href="/checkout"
                className="block hover:text-blue-600 cursor-pointer"
              >
                Checkout
              </Link>
            </li>
            {user?.role === "ADMIN" && (
              <li>
                <Link
                  href="/admin"
                  className="block hover:text-blue-600 cursor-pointer"
                >
                  Admin
                </Link>
              </li>
            )}
          </ul>
        </nav>
      )}
    </nav>
  );
};
