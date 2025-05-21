"use client";

import { useState, useEffect, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNumber } from "@/lib/common";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { Product } from "../admin/products/page";
import { Input } from "@/components/ui/input";
import { redirect, useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface Address {
  id?: string;
  full_address: string;
  street: string;
  district: string;
  region: string;
  city: string;
}

function CheckoutPageContent() {
  const router = useRouter();
  const [items, setItems] = useState<Product[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null
  );
  const [address, setAddress] = useState<Address>({
    full_address: "",
    street: "",
    district: "",
    region: "",
    city: "",
  });
  const [orderCode, setOrderCode] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("cart");
    if (stored) {
      setItems(JSON.parse(stored));
    }

    const user = JSON.parse(localStorage.getItem("ecom_user") || "{}");
    if (user.id) {
      fetch(`/api/addresses?user_id=${user.id}`)
        .then((res) => res.json())
        .then((data) => {
          setAddresses(data.data || []);
        })
        .catch((error) => {
          console.error("Error fetching addresses:", error);
        });
    }
  }, []);

  useEffect(() => {
    if (!orderCode && !qrUrl) return;

    // Thiết lập SSE
    const eventSource = new EventSource(`/api/checkout?orderCode=${orderCode}`);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('data.status', data.status);
      if (data.status === 'SUCCESS') {
        router.push('/success');
        eventSource.close();
      }
    };

    eventSource.onerror = () => {
      console.error('SSE error, closing connection');
      eventSource.close();
    };

    // Đóng kết nối khi component unmount
    return () => {
      eventSource.close();
    };
  }, [orderCode, qrUrl, router]);

  useEffect(() => {
    if (selectedAddressId) {
      const selected = addresses.find((addr) => addr.id === selectedAddressId);
      if (selected) {
        setAddress({
          full_address: selected.full_address,
          street: selected.street,
          district: selected.district,
          region: selected.region,
          city: selected.city,
        });
      }
    } else {
      setAddress({
        full_address: "",
        street: "",
        district: "",
        region: "",
        city: "",
      });
    }
  }, [selectedAddressId, addresses]);

  const updateLocalStorage = (updatedItems: Product[]) => {
    setItems(updatedItems);
    localStorage.setItem("cart", JSON.stringify(updatedItems));
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  const addItem = (item: Product) => {
    const updated = items.map((it) =>
      it.id === item.id ? { ...it, quantity: it.quantity + item.quantity } : it
    );
    updateLocalStorage(updated);
  };

  const removeItem = (id: string) => {
    const updated = items.map((it) =>
      it.id === id && it.quantity > 1
        ? { ...it, quantity: it.quantity - 1 }
        : it
    );
    updateLocalStorage(updated.filter((it) => it.quantity > 0));
  };

  const removeItemById = (id: string) => {
    const updated = items.filter((it) => it.id !== id);
    updateLocalStorage(updated);
    setSelectedIds((prev) => prev.filter((itemId) => itemId !== id));
  };

  const selectedItems = items.filter((item) => selectedIds.includes(item.id));
  const total = selectedItems.reduce(
    (acc, item) => acc + item.pricing * item.quantity,
    0
  );

  const isAddressValid =
    address.full_address.trim() !== "" &&
    address.street.trim() !== "" &&
    address.district.trim() !== "" &&
    address.region.trim() !== "" &&
    address.city.trim() !== "";

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAddress((prev) => ({ ...prev, [name]: value }));
    if (selectedAddressId) {
      setSelectedAddressId(null);
    }
  };

  const handleCheckout = async () => {
    const user = JSON.parse(localStorage.getItem("ecom_user") || "{}");
    if (!user.id) {
      redirect("/sign-in");
    }
    if (!isAddressValid) {
      alert("Vui lòng điền đầy đủ thông tin địa chỉ giao hàng");
      return;
    }

    setLoading(true);
    let addressId = selectedAddressId;

    if (!selectedAddressId) {
      try {
        const response = await fetch("/api/addresses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            full_address: address.full_address,
            street: address.street,
            district: address.district,
            region: address.region,
            city: address.city,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to save address");
        }

        const { address: newAddress } = await response.json();
        if (!newAddress?.id) {
          throw new Error("Address creation succeeded but no ID returned");
        }
        addressId = newAddress.id;
        setAddresses((prev) => [...prev, newAddress]);
      } catch (error) {
        console.error(error || "Failed to save address");
        setLoading(false);
        return;
      }
    }

    const totalAmount = selectedItems.reduce(
      (sum, item) => sum + item.pricing * item.quantity,
      0
    );

    const referenceCode = `ORD${Date.now()}`;
    setOrderCode(referenceCode);
    const payload = {
      amount: totalAmount,
      customer_id: user.id,
      address_id: addressId,
      products: selectedItems,
      description: referenceCode,
    };

    fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then(() => {
        const orderId = referenceCode;
        const acc = "VQRQACMGC9486";
        const bank = "MBBank";
        const amount = totalAmount;
        const des = orderId;
        const redirectUrl = encodeURIComponent(
          `https://stripe-ecomerce.vercel.app/success?order=${orderId}`
        );

        const qr = `https://qr.sepay.vn/img?acc=${acc}&bank=${bank}&amount=${amount}&des=${des}&redirect=${redirectUrl}`;
        setQrUrl(qr);
      })
      .catch((error) => {
        console.error("Error saving Order:", error);
        alert("Failed to create order");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 flex justify-center items-center min-h-[60vh]">
        <Card className="w-full max-w-md lg:max-w-xl text-center py-10 px-6">
          <CardContent className="flex flex-col items-center space-y-4">
            <ShoppingCart className="h-10 w-10 text-muted-foreground" />
            <h2 className="text-2xl font-semibold">Your cart is empty</h2>
            <p className="text-sm text-muted-foreground">
              Looks like you haven’t added anything to your cart yet.
            </p>
            <Link href="/products" passHref>
              <Button variant="default" className="mt-4">
                Continue Shopping
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Checkout</h1>
      <div className="flex flex-wrap gap-[24px]">
        <Card className="flex-1 mb-8">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-bold text-primary">
              Order Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {items.map((item) => (
                <li key={item.id} className="flex flex-col gap-2 border-b pb-2">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-3 items-start">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(item.id)}
                        onChange={() => toggleSelect(item.id)}
                        className="mt-1 cursor-pointer"
                      />
                      <Image
                        src={item.image}
                        alt={item.name}
                        loading="lazy"
                        width={64}
                        height={64}
                        className="object-cover rounded-md"
                      />
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatNumber(item.pricing)} VNĐ x {item.quantity}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="font-semibold">
                        {formatNumber(item.pricing * item.quantity)} VNĐ
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItemById(item.id)}
                        className="text-red-500 hover:text-red-600 cursor-pointer"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="cursor-pointer"
                      onClick={() => removeItem(item.id)}
                    >
                      –
                    </Button>
                    <span className="text-lg font-semibold">
                      {item.quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="cursor-pointer"
                      onClick={() => addItem({ ...item, quantity: 1 })}
                    >
                      +
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-6 text-right text-lg font-bold">
              Selected Total:{" "}
              <span className="text-primary">{formatNumber(total)} VND</span>
            </div>
          </CardContent>
        </Card>

        <Card className="flex-1 mb-8">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-primary">
              Delivery Address
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div>
              <label
                className="block text-sm font-medium mb-1"
                htmlFor="address_select"
              >
                Select Address
              </label>
              <Select
                value={selectedAddressId || ""}
                onValueChange={(value) =>
                  setSelectedAddressId(value === "new" ? null : value)
                }
              >
                <SelectTrigger id="address_select">
                  <SelectValue placeholder="Choose an address" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">Enter new address</SelectItem>
                  {addresses.map((addr) => (
                    <SelectItem key={addr.id} value={addr.id!}>
                      {addr.full_address}, {addr.city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label
                className="block text-sm font-medium mb-1"
                htmlFor="full_address"
              >
                Full Address
              </label>
              <Input
                id="full_address"
                name="full_address"
                type="text"
                value={address.full_address}
                onChange={handleInputChange}
                placeholder="Enter full address"
                required
              />
            </div>
            <div>
              <label
                className="block text-sm font-medium mb-1"
                htmlFor="street"
              >
                Street
              </label>
              <Input
                id="street"
                name="street"
                type="text"
                value={address.street}
                onChange={handleInputChange}
                placeholder="Enter street"
                required
              />
            </div>
            <div>
              <label
                className="block text-sm font-medium mb-1"
                htmlFor="district"
              >
                District
              </label>
              <Input
                id="district"
                name="district"
                type="text"
                value={address.district}
                onChange={handleInputChange}
                placeholder="Enter district"
                required
              />
            </div>
            <div>
              <label
                className="block text-sm font-medium mb-1"
                htmlFor="region"
              >
                Region
              </label>
              <Input
                id="region"
                name="region"
                type="text"
                value={address.region}
                onChange={handleInputChange}
                placeholder="Enter region"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="city">
                City
              </label>
              <Input
                id="city"
                name="city"
                type="text"
                value={address.city}
                onChange={handleInputChange}
                placeholder="Enter city"
                required
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="max-w-md mx-auto">
        <Button
          type="button"
          variant="default"
          className="w-full cursor-pointer mb-4"
          disabled={selectedItems.length === 0 || loading}
          onClick={handleCheckout}
        >
          {loading
            ? "Generating QR..."
            : selectedItems.length === 0
            ? "Select items to pay"
            : "Proceed to Payment"}
        </Button>

        {qrUrl && (
          <div className="border rounded-md p-4 mt-4 text-center">
            <p className="mb-2 font-semibold">Scan QR to pay:</p>
            <Image
              src={qrUrl}
              alt="QR thanh toán"
              height={400}
              width={400}
              className="h-[400px] w-[400px]"
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CheckoutPageContent />
    </Suspense>
  );
}
