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

interface Address {
  id: string;
  full_address: string;
  street?: string;
  district?: string;
  region?: string;
  city: string;
}

function AddressModal({
  open,
  onOpenChange,
  onSave,
  initialData,
  isSaving,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: Address) => void;
  initialData?: Address;
  isSaving: boolean;
}) {
  const [formData, setFormData] = useState<Address>({
    id: initialData?.id || "",
    full_address: initialData?.full_address || "",
    street: initialData?.street || "",
    district: initialData?.district || "",
    region: initialData?.region || "",
    city: initialData?.city || "",
  });

  useEffect(() => {
    setFormData({
      id: initialData?.id || "",
      full_address: initialData?.full_address || "",
      street: initialData?.street || "",
      district: initialData?.district || "",
      region: initialData?.region || "",
      city: initialData?.city || "",
    });
  }, [initialData]);

  function onChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.full_address.trim()) return alert("Full address is required");
    if (!formData.city.trim()) return alert("city is required");
    onSave(formData as Address);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Address" : "Add Address"}
          </DialogTitle>
          <DialogDescription>
            {initialData
              ? "Update Address details below."
              : "Enter new Address information."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
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
              value={formData.full_address}
              onChange={onChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="street">
              Street
            </label>
            <Input
              id="street"
              name="street"
              value={formData.street}
              onChange={onChange}
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
              value={formData.district}
              onChange={onChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="region">
              Region
            </label>
            <Input
              id="region"
              name="region"
              value={formData.region}
              onChange={onChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="city">
              City
            </label>
            <Input
              id="city"
              name="city"
              value={formData.city}
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
                "Add Address"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function AddressPage() {
  const [address, setAddress] = useState<Address[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    search: "",
  });

  function fetchAddress() {
    setIsLoading(true);
    fetch("/api/addresses")
      .then((res) => res.json())
      .then((data) => {
        setAddress(data || []);
      })
      .catch((error) => {
        console.error("Error fetching Address:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  useEffect(() => {
    fetchAddress();
  }, []);

  const filteredAddress = address?.filter((addr) => {
    const nameMatch = addr.full_address
      .toLowerCase()
      .includes(filters.search.toLowerCase());
    return nameMatch;
  });

  function handleSave(addr: Address) {
    setIsSaving(true);
    const isNew = !addr.id;

    const payload = isNew ? { ...addr, id: undefined } : addr;

    fetch(isNew ? "/api/addresses" : `/api/addresses/${addr.id}`, {
      method: isNew ? "POST" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((savedAddress) => {
        setAddress((prev) => {
          if (isNew) {
            return [...prev, savedAddress];
          } else {
            return prev.map((p) =>
              p.id === savedAddress.id ? savedAddress : p
            );
          }
        });
        setModalOpen(false);
      })
      .catch((error) => {
        console.error("Error saving Address:", error);
      })
      .finally(() => {
        setIsSaving(false);
      });
  }

  function openAddModal() {
    setEditingAddress(null);
    setModalOpen(true);
  }

  function openEditModal(addr: Address) {
    setEditingAddress(addr);
    setModalOpen(true);
  }

  function handleDelete(addrId: string) {
    setIsDeleting(addrId);
    fetch(`/api/addresses/${addrId}`, {
      method: "DELETE",
    })
      .then(() => {
        setAddress((prev) => prev.filter((p) => p.id !== addrId));
      })
      .catch((error) => {
        console.error("Error deleting Address:", error);
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
            placeholder="Search full address..."
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
          <Button size="sm" onClick={fetchAddress} disabled={isLoading}>
            Reload
          </Button>
          <Button size="sm" onClick={openAddModal} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              </>
            ) : (
              "Add Address"
            )}
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded border border-gray-300">
        <Table className="text-sm">
          <TableHeader className="bg-gray-200">
            <TableRow>
              <TableHead>Full Adress</TableHead>
              <TableHead>Street</TableHead>
              <TableHead>District</TableHead>
              <TableHead>Region</TableHead>
              <TableHead>City</TableHead>
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
                  </TableRow>
                ))
            ) : filteredAddress.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="text-center">
                  No Address found.
                </TableCell>
              </TableRow>
            ) : (
              filteredAddress.map((addr) => (
                <TableRow key={addr.id} className="align-middle">
                  <TableCell>{addr?.full_address}</TableCell>
                  <TableCell>{addr?.street}</TableCell>
                  <TableCell>{addr?.district}</TableCell>
                  <TableCell>{addr?.region}</TableCell>
                  <TableCell>{addr?.city}</TableCell>
                  <TableCell className="space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditModal(addr)}
                      disabled={isDeleting === addr.id}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(addr.id)}
                      disabled={isDeleting === addr.id}
                    >
                      {isDeleting === addr.id ? (
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

      <AddressModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSave={handleSave}
        initialData={editingAddress || undefined}
        isSaving={isSaving}
      />
    </div>
  );
}
