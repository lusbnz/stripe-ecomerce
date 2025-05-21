"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";
import moment from "moment";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface Product {
  id: number;
  name: string;
  pricing: number;
  created_at: string;
  updated_at: string;
  description: string;
  category_id: number;
  category_name?: string;
  color: string;
  quantity: number;
  image: string;
}

interface Category {
  id: number;
  name: string;
}

const COLORS = ["Brown", "White", "Black", "Gray", "Blue", "Silver"];

function ProductModal({
  open,
  onOpenChange,
  onSave,
  initialData,
  isSaving,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: Product) => void;
  initialData?: Product;
  isSaving: boolean;
}) {
  const [formData, setFormData] = useState({
    id: initialData?.id || 0,
    name: initialData?.name || "",
    pricing: initialData?.pricing || "",
    category_id: initialData?.category_id || "",
    color: initialData?.color || "",
    quantity: initialData?.quantity || 0,
    description: initialData?.description || "",
    image: initialData?.image || "",
  });
  const [categories, setCategories] = useState<Category[]>([]);

  // Fetch categories when modal opens
  useEffect(() => {
    if (open) {
      fetch("/api/categories")
        .then((res) => res.json())
        .then((data) => setCategories(data || []))
        .catch((error) => console.error("Error fetching categories:", error));
    }
  }, [open]);

  useEffect(() => {
    setFormData({
      id: initialData?.id || 0,
      name: initialData?.name || "",
      pricing: initialData?.pricing || "",
      category_id: initialData?.category_id || "",
      color: initialData?.color || "",
      quantity: initialData?.quantity || 0,
      description: initialData?.description || "",
      image: initialData?.image || "",
    });
  }, [initialData]);

  function onChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "quantity"
          ? Number(value)
          : name === "pricing"
          ? parseFloat(value)
          : value,
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.name.trim()) return alert("Name is required");
    if (!formData.pricing || isNaN(Number(formData.pricing)))
      return alert("Price is required and must be a number");
    if (!formData.quantity || isNaN(Number(formData.quantity)))
      return alert("Quantity is required and must be a number");
    if (!formData.image.trim()) return alert("Image URL is required");
    if (!formData.category_id) return alert("Category is required");
    if (!formData.color) return alert("Color is required");
    onSave({
      ...formData,
      category_id: Number(formData.category_id),
      pricing: Number(formData.pricing),
    } as Product);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Product" : "Add Product"}
          </DialogTitle>
          <DialogDescription>
            {initialData
              ? "Update product details below."
              : "Enter new product information."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="name">
              Name
            </label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={onChange}
              required
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="pricing">
              Price
            </label>
            <Input
              id="pricing"
              name="pricing"
              type="number"
              value={formData.pricing}
              onChange={onChange}
              placeholder="1234"
              required
              className="w-full"
            />
          </div>

          <div>
            <label
              className="block text-sm font-medium mb-1"
              htmlFor="category_id"
            >
              Category
            </label>
            <Select
              value={formData.category_id?.toString()}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, category_id: value }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem
                    key={category.id}
                    value={category.id.toString()}
                  >
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="color">
              Color
            </label>
            <Select
              value={formData.color}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, color: value }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select color" />
              </SelectTrigger>
              <SelectContent>
                {COLORS.map((color) => (
                  <SelectItem key={color} value={color}>
                    {color}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label
              className="block text-sm font-medium mb-1"
              htmlFor="quantity"
            >
              Quantity
            </label>
            <Input
              id="quantity"
              name="quantity"
              type="number"
              value={formData.quantity}
              onChange={onChange}
              min={0}
              required
              className="w-full"
            />
          </div>

          <div>
            <label
              className="block text-sm font-medium mb-1"
              htmlFor="description"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={onChange}
              rows={3}
              className="w-full border rounded px-2 py-1 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="image">
              Image URL
            </label>
            <Input
              id="image"
              name="image"
              value={formData.image}
              onChange={onChange}
              placeholder="https://..."
              required
              className="w-full"
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                </>
              ) : initialData ? (
                "Save Changes"
              ) : (
                "Add Product"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [filters, setFilters] = useState({
    search: "",
    minPrice: "",
    maxPrice: "",
    category_id: "",
    color: "",
  });

  function fetchData() {
    setIsLoading(true);
    Promise.all([
      fetch("/api/products").then((res) => res.json()),
      fetch("/api/categories").then((res) => res.json()),
    ])
      .then(([productsData, categoriesData]) => {
        setProducts(
          productsData.map((p: Product) => ({
            ...p,
            category_name:
              categoriesData.find((c: Category) => c.id === p.category_id)?.name ||
              "Uncategorized",
          }))
        );
        setCategories(categoriesData);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  useEffect(() => {
    fetchData();
  }, []);

  const filteredProducts = products?.filter((product) => {
    const nameMatch = product.name
      .toLowerCase()
      .includes(filters.search.toLowerCase());
    const minMatch =
      filters.minPrice === "" || product.pricing >= Number(filters.minPrice);
    const maxMatch =
      filters.maxPrice === "" || product.pricing <= Number(filters.maxPrice);
    const categoryMatch =
      !filters.category_id || product.category_id === Number(filters.category_id);
    const colorMatch =
      !filters.color || product.color === filters.color;
    return nameMatch && minMatch && maxMatch && categoryMatch && colorMatch;
  });

  function handleSave(product: Product) {
    setIsSaving(true);
    const isNew = !product.id;

    const payload = isNew
      ? { ...product, id: undefined, category_name: undefined }
      : { ...product, category_name: undefined };

    fetch(isNew ? "/api/products" : `/api/products/${product.id}`, {
      method: isNew ? "POST" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((savedProduct) => {
        setProducts((prev) => {
          const categoryName =
            categories.find((c) => c.id === savedProduct.category_id)?.name ||
            "Uncategorized";
          const updatedProduct = { ...savedProduct, category_name: categoryName };
          if (isNew) {
            return [...prev, updatedProduct];
          } else {
            return prev.map((p) =>
              p.id === savedProduct.id ? updatedProduct : p
            );
          }
        });
        setModalOpen(false);
      })
      .catch((error) => {
        console.error("Error saving product:", error);
      })
      .finally(() => {
        setIsSaving(false);
      });
  }

  function openAddModal() {
    setEditingProduct(null);
    setModalOpen(true);
  }

  function openEditModal(product: Product) {
    setEditingProduct(product);
    setModalOpen(true);
  }

  function handleDelete(productId: number) {
    setIsDeleting(productId);
    fetch(`/api/products/${productId}`, {
      method: "DELETE",
    })
      .then(() => {
        setProducts((prev) => prev.filter((p) => p.id !== productId));
      })
      .catch((error) => {
        console.error("Error deleting product:", error);
      })
      .finally(() => {
        setIsDeleting(null);
      });
  }

  function handleResetFilters() {
    setFilters({
      search: "",
      minPrice: "",
      maxPrice: "",
      category_id: "",
      color: "",
    });
  }

  return (
    <div>
      <div className="flex flex-wrap justify-between mb-4 gap-2">
        <div className="flex flex-wrap gap-2">
          <Input
            className="w-full sm:w-[200px]"
            placeholder="Search name..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
          <Input
            className="w-full sm:w-[120px]"
            placeholder="Min Price"
            type="number"
            value={filters.minPrice}
            onChange={(e) =>
              setFilters({ ...filters, minPrice: e.target.value })
            }
          />
          <Input
            className="w-full sm:w-[120px]"
            placeholder="Max Price"
            type="number"
            value={filters.maxPrice}
            onChange={(e) =>
              setFilters({ ...filters, maxPrice: e.target.value })
            }
          />
          <Select
            value={filters.category_id}
            onValueChange={(value) =>
              setFilters({ ...filters, category_id: value })
            }
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem
                  key={category.id}
                  value={category.id.toString()}
                >
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filters.color}
            onValueChange={(value) =>
              setFilters({ ...filters, color: value })
            }
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Select color" />
            </SelectTrigger>
            <SelectContent>
              {COLORS.map((color) => (
                <SelectItem key={color} value={color}>
                  {color}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={handleResetFilters}
          >
            Reset
          </Button>
        </div>
        <div className="flex gap-4">
          <Button size="sm" onClick={fetchData} disabled={isLoading}>
            Reload
          </Button>
          <Button size="sm" onClick={openAddModal} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              </>
            ) : (
              "Add Product"
            )}
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded border border-gray-300">
        <Table className="text-sm">
          <TableHeader className="bg-gray-200">
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Color</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Updated At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array(5)
                .fill(0)
                .map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Skeleton className="h-8 w-8 rounded" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-12" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-48" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-32" />
                    </TableCell>
                  </TableRow>
                ))
            ) : filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="text-center">
                  No products found.
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => (
                <TableRow key={product.id} className="align-middle">
                  <TableCell>
                    <Image
                      src={product?.image}
                      alt={product?.name}
                      width={32}
                      height={32}
                      className="rounded object-cover h-[32px] w-[32px]"
                    />
                  </TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.pricing}</TableCell>
                  <TableCell>{product.category_name || "Uncategorized"}</TableCell>
                  <TableCell>{product.color}</TableCell>
                  <TableCell>{product.quantity}</TableCell>
                  <TableCell
                    dangerouslySetInnerHTML={{
                      __html:
                        product.description?.length > 60
                          ? product.description.slice(0, 60) + "..."
                          : product.description,
                    }}
                  />
                  <TableCell>
                    {moment(product.created_at).format("DD/MM/YYYY HH:mm")}
                  </TableCell>
                  <TableCell>
                    {moment(product.updated_at).format("DD/MM/YYYY HH:mm")}
                  </TableCell>
                  <TableCell className="space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditModal(product)}
                      disabled={isDeleting === product.id}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(product.id)}
                      disabled={isDeleting === product.id}
                    >
                      {isDeleting === product.id ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        </>
                      ) : (
                        "Delete"
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ProductModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSave={handleSave}
        initialData={editingProduct || undefined}
        isSaving={isSaving}
      />
    </div>
  );
}