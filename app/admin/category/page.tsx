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

export interface Category {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

function CategoryModal({
  open,
  onOpenChange,
  onSave,
  initialData,
  isSaving,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: Category) => void;
  initialData?: Category;
  isSaving: boolean;
}) {
  const [formData, setFormData] = useState({
    id: initialData?.id || 0,
    name: initialData?.name || "",
  });

  useEffect(() => {
    setFormData({
      id: initialData?.id || 0,
      name: initialData?.name || "",
    });
  }, [initialData]);

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.name.trim()) return alert("Name is required");
    onSave(formData as Category);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Category" : "Add Category"}
          </DialogTitle>
          <DialogDescription>
            {initialData
              ? "Update category details below."
              : "Enter new category information."}
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
                "Add Category"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  function fetchCategories() {
    setIsLoading(true);
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        setCategories(data || []);
      })
      .catch((error) => {
        console.error("Error fetching categories:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  function handleSave(category: Category) {
    setIsSaving(true);
    const isNew = !category.id;

    const payload = isNew ? { ...category, id: undefined } : category;

    fetch(isNew ? "/api/categories" : `/api/categories/${category.id}`, {
      method: isNew ? "POST" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((savedCategory) => {
        setCategories((prev) => {
          if (isNew) {
            return [...prev, savedCategory];
          } else {
            return prev.map((c) =>
              c.id === savedCategory.id ? savedCategory : c
            );
          }
        });
        setModalOpen(false);
      })
      .catch((error) => {
        console.error("Error saving category:", error);
      })
      .finally(() => {
        setIsSaving(false);
      });
  }

  function openAddModal() {
    setEditingCategory(null);
    setModalOpen(true);
  }

  function openEditModal(category: Category) {
    setEditingCategory(category);
    setModalOpen(true);
  }

  function handleDelete(categoryId: number) {
    setIsDeleting(categoryId);
    fetch(`/api/categories/${categoryId}`, {
      method: "DELETE",
    })
      .then(() => {
        setCategories((prev) => prev.filter((c) => c.id !== categoryId));
      })
      .catch((error) => {
        console.error("Error deleting category:", error);
      })
      .finally(() => {
        setIsDeleting(null);
      });
  }

  return (
    <div>
      <div className="flex flex-wrap justify-between mb-4 gap-2">
        <div className="flex gap-4">
          <Button size="sm" onClick={fetchCategories} disabled={isLoading}>
            Reload
          </Button>
          <Button size="sm" onClick={openAddModal} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              </>
            ) : (
              "Add Category"
            )}
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded border border-gray-300">
        <Table className="text-sm">
          <TableHeader className="bg-gray-200">
            <TableRow>
              <TableHead>Name</TableHead>
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
                      <Skeleton className="h-4 w-32" />
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
            ) : categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  No categories found.
                </TableCell>
              </TableRow>
            ) : (
              categories.map((category) => (
                <TableRow key={category.id} className="align-middle">
                  <TableCell>{category.name}</TableCell>
                  <TableCell>
                    {moment(category.created_at).format("DD/MM/YYYY HH:mm")}
                  </TableCell>
                  <TableCell>
                    {moment(category.updated_at).format("DD/MM/YYYY HH:mm")}
                  </TableCell>
                  <TableCell className="space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditModal(category)}
                      disabled={isDeleting === category.id}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(category.id)}
                      disabled={isDeleting === category.id}
                    >
                      {isDeleting === category.id ? (
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

      <CategoryModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSave={handleSave}
        initialData={editingCategory || undefined}
        isSaving={isSaving}
      />
    </div>
  );
}