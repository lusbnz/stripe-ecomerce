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

interface Customer {
  id: string;
  name: string;
  email: string;
  created_at: string;
  address?: Address;
}

interface Address {
  id?: string;
  full_address?: string;
  street?: string;
  district?: string;
  region?: string;
  city?: string;
}

function CustomerModal({
  open,
  onOpenChange,
  onSave,
  initialData,
  isSaving,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: Customer) => void;
  initialData?: Customer;
  isSaving: boolean;
}) {
  const [formData, setFormData] = useState<Customer>({
    id: initialData?.id || "",
    name: initialData?.name || "",
    email: initialData?.email || "",
    created_at: initialData?.created_at || "",
    address: initialData?.address || {
      id: "",
      full_address: "",
      street: "",
      district: "",
      region: "",
      city: "",
    },
  });

  useEffect(() => {
    setFormData({
      id: initialData?.id || "",
      name: initialData?.name || "",
      email: initialData?.email || "",
      created_at: initialData?.created_at || "",
      address: initialData?.address || {
        id: "",
        full_address: "",
        street: "",
        district: "",
        region: "",
        city: "",
      },
    });
  }, [initialData]);

  function onChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;

    if (name.startsWith("address.")) {
      const addressField = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.name.trim()) return alert("Name is required");
    onSave(formData as Customer);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Customer" : "Add Customer"}
          </DialogTitle>
          <DialogDescription>
            {initialData
              ? "Update Customer details below."
              : "Enter new Customer information."}
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

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="email">
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
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
                "Add Customer"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    search: "",
  });

  function fetchCustomers() {
    setIsLoading(true);
    fetch("/api/customers")
      .then((res) => res.json())
      .then((data) => {
        setCustomers(data || []);
      })
      .catch((error) => {
        console.error("Error fetching Customers:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filteredCustomers = customers?.filter((customer) => {
    const nameMatch = customer.name
      .toLowerCase()
      .includes(filters.search.toLowerCase());
    return nameMatch;
  });

  function handleSave(customer: Customer) {
    setIsSaving(true);
    const isNew = !customer.id;

    const payload = isNew
      ? { ...customer, id: undefined, created_at: undefined }
      : { ...customer, created_at: undefined };

    fetch(isNew ? "/api/customers" : `/api/customers/${customer.id}`, {
      method: isNew ? "POST" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((savedCustomer) => {
        setCustomers((prev) => {
          if (isNew) {
            return [...prev, savedCustomer];
          } else {
            return prev.map((p) =>
              p.id === savedCustomer.id ? savedCustomer : p
            );
          }
        });
        setModalOpen(false);
      })
      .catch((error) => {
        console.error("Error saving Customer:", error);
      })
      .finally(() => {
        setIsSaving(false);
      });
  }

  function openAddModal() {
    setEditingCustomer(null);
    setModalOpen(true);
  }

  function openEditModal(Customer: Customer) {
    setEditingCustomer(Customer);
    setModalOpen(true);
  }

  function handleDelete(CustomerId: string) {
    setIsDeleting(CustomerId);
    fetch(`/api/customers/${CustomerId}`, {
      method: "DELETE",
    })
      .then(() => {
        setCustomers((prev) => prev.filter((p) => p.id !== CustomerId));
      })
      .catch((error) => {
        console.error("Error deleting Customer:", error);
      })
      .finally(() => {
        setIsDeleting(null);
      });
  }

  return (
    <div>
      <div className="flex justify-between mb-4">
        <div className="flex flex-wrap gap-2">
          <Input
            className="w-full sm:w-[200px]"
            placeholder="Search name..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() =>
              setFilters({
                search: "",
              })
            }
          >
            Reset
          </Button>
        </div>
        <div className="flex gap-4">
          <Button size="sm" onClick={fetchCustomers} disabled={isLoading}>
            Reload
          </Button>
          <Button size="sm" onClick={openAddModal} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              </>
            ) : (
              "Add Customer"
            )}
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded border border-gray-300">
        <Table className="text-sm">
          <TableHeader className="bg-gray-200">
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Full Adress</TableHead>
              <TableHead>Street</TableHead>
              <TableHead>District</TableHead>
              <TableHead>Region</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Created At</TableHead>
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
                      <Skeleton className="h-8 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-32" />
                    </TableCell>
                  </TableRow>
                ))
            ) : filteredCustomers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="text-center">
                  No Customers found.
                </TableCell>
              </TableRow>
            ) : (
              filteredCustomers.map((customer) => (
                <TableRow key={customer.id} className="align-middle">
                  <TableCell>{customer.name}</TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell>{customer.address?.full_address}</TableCell>
                  <TableCell>{customer.address?.street}</TableCell>
                  <TableCell>{customer.address?.district}</TableCell>
                  <TableCell>{customer.address?.region}</TableCell>
                  <TableCell>{customer.address?.city}</TableCell>
                  <TableCell>
                    {moment(customer.created_at).format("DD/MM/YYYY HH:mm")}
                  </TableCell>
                  <TableCell className="space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditModal(customer)}
                      disabled={isDeleting === customer.id}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(customer.id)}
                      disabled={isDeleting === customer.id}
                    >
                      {isDeleting === customer.id ? (
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

      <CustomerModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSave={handleSave}
        initialData={editingCustomer || undefined}
        isSaving={isSaving}
      />
    </div>
  );
}
