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
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
//   DialogDescription,
// } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
// import { Loader2 } from "lucide-react";

interface Order {
  id: string;
  amount: string;
  customer_id: string;
  customer_name?: string;
  payment_method: string;
  description?: string;
  address_id: string;
  shipping_details?: string;
  status: string;
  created_at: string;
  updated_at: string;
  users?: {
    name?: string;
  }
}

// function OrderModal({
//   open,
//   onOpenChange,
//   onSave,
//   initialData,
//   isSaving,
// }: {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   onSave: (data: Order) => void;
//   initialData?: Order;
//   isSaving: boolean;
// }) {
//   const [formData, setFormData] = useState<Order>({
//     id: initialData?.id || "",
//     amount: initialData?.amount || "",
//     customer_id: initialData?.customer_id || "",
//     payment_method: initialData?.payment_method || "",
//     description: initialData?.description || "",
//     address_id: initialData?.address_id || "",
//     shipping_details: initialData?.shipping_details || "",
//     status: initialData?.status || "PENDING",
//     created_at: initialData?.created_at || "",
//     updated_at: initialData?.updated_at || "",
//   });

//   useEffect(() => {
//     setFormData({
//       id: initialData?.id || "",
//       amount: initialData?.amount || "",
//       customer_id: initialData?.customer_id || "",
//       payment_method: initialData?.payment_method || "",
//       description: initialData?.description || "",
//       address_id: initialData?.address_id || "",
//       shipping_details: initialData?.shipping_details || "",
//       status: initialData?.status || "PENDING",
//       created_at: initialData?.created_at || "",
//       updated_at: initialData?.updated_at || "",
//     });
//   }, [initialData]);

//   function onChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   }

//   function handleSubmit(e: React.FormEvent) {
//     e.preventDefault();
//     if (!formData.amount.trim()) return alert("Amount is required");
//     if (!formData.customer_id.trim()) return alert("Customer ID is required");
//     if (!formData.payment_method.trim()) return alert("Payment method is required");
//     onSave(formData as Order);
//   }

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="sm:max-w-2xl">
//         <DialogHeader>
//           <DialogTitle>{initialData ? "Edit Order" : "Add Order"}</DialogTitle>
//           <DialogDescription>
//             {initialData ? "Update order details below." : "Enter new order information."}
//           </DialogDescription>
//         </DialogHeader>

//         <form onSubmit={handleSubmit} className="space-y-4 mt-2">
//           <div>
//             <label className="block text-sm font-medium mb-1" htmlFor="amount">
//               Amount
//             </label>
//             <Input
//               id="amount"
//               name="amount"
//               type="number"
//               step="0.01"
//               value={formData.amount}
//               onChange={onChange}
//               required
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium mb-1" htmlFor="customer_id">
//               Customer ID
//             </label>
//             <Input
//               id="customer_id"
//               name="customer_id"
//               value={formData.customer_id}
//               onChange={onChange}
//               required
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium mb-1" htmlFor="payment_method">
//               Payment Method
//             </label>
//             <Input
//               id="payment_method"
//               name="payment_method"
//               value={formData.payment_method}
//               onChange={onChange}
//               required
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium mb-1" htmlFor="description">
//               Description
//             </label>
//             <Input
//               id="description"
//               name="description"
//               value={formData.description}
//               onChange={onChange}
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium mb-1" htmlFor="address_id">
//               Address ID
//             </label>
//             <Input
//               id="address_id"
//               name="address_id"
//               value={formData.address_id}
//               onChange={onChange}
//               required
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium mb-1" htmlFor="shipping_details">
//               Shipping Details
//             </label>
//             <Input
//               id="shipping_details"
//               name="shipping_details"
//               value={formData.shipping_details}
//               onChange={onChange}
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium mb-1" htmlFor="status">
//               Status
//             </label>
//             <Input
//               id="status"
//               name="status"
//               value={formData.status}
//               onChange={onChange}
//             />
//           </div>

//           <DialogFooter>
//             <Button type="submit" disabled={isSaving}>
//               {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : initialData ? "Save Changes" : "Add Order"}
//             </Button>
//           </DialogFooter>
//         </form>
//       </DialogContent>
//     </Dialog>
//   );
// }

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  // const [modalOpen, setModalOpen] = useState(false);
  // const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // const [isSaving, setIsSaving] = useState(false);
  // const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [filters, setFilters] = useState({ search: "" });

  function fetchOrders() {
    setIsLoading(true);
    fetch("/api/orders")
      .then((res) => res.json())
      .then((data) => setOrders(data || []))
      .catch((err) => console.error("Error fetching orders:", err))
      .finally(() => setIsLoading(false));
  }

  useEffect(() => { fetchOrders(); }, []);

  const filtered = orders?.filter((o) =>
    o?.users?.name?.toLowerCase()?.includes(filters.search.toLowerCase())
  );

  // function handleSave(order: Order) {
  //   setIsSaving(true);
  //   const isNew = !order.id;
  //   const url = isNew ? "/api/orders" : `/api/orders/${order.id}`;
  //   const method = isNew ? "POST" : "PUT";

  //   fetch(url, {
  //     method,
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify(order),
  //   })
  //     .then((res) => res.json())
  //     .then((saved) => {
  //       setOrders((prev) =>
  //         isNew ? [...prev, saved] : prev.map((o) => (o.id === saved.id ? saved : o))
  //       );
  //       setModalOpen(false);
  //     })
  //     .catch((err) => console.error("Error saving order:", err))
  //     .finally(() => setIsSaving(false));
  // }

  // function openAdd() {
  //   setEditingOrder(null);
  //   setModalOpen(true);
  // }

  // function openEdit(o: Order) {
  //   setEditingOrder(o);
  //   setModalOpen(true);
  // }

  // function handleDelete(id: string) {
  //   setIsDeleting(id);
  //   fetch(`/api/orders/${id}`, { method: "DELETE" })
  //     .then(() => setOrders((prev) => prev.filter((o) => o.id !== id)))
  //     .catch((err) => console.error("Error deleting order:", err))
  //     .finally(() => setIsDeleting(null));
  // }

  return (
    <div>
      <div className="flex flex-wrap justify-between mb-4 gap-2">
        <div className="flex flex-wrap gap-2">
          <Input
            className="w-full sm:w-[200px]"
            placeholder="Search by customer..."
            value={filters.search}
            onChange={(e) => setFilters({ search: e.target.value })}
          />
          <Button variant="outline" onClick={() => setFilters({ search: "" })}>
            Reset
          </Button>
        </div>
        <div className="flex gap-4">
          <Button size="sm" onClick={fetchOrders} disabled={isLoading}>
            Reload
          </Button>
          {/* <Button size="sm" onClick={openAdd} disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Add Order"}
          </Button> */}
        </div>
      </div>

      <div className="overflow-x-auto rounded border border-gray-300">
        <Table className="text-sm">
          <TableHeader className="bg-gray-200">
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
              {/* <TableHead>Actions</TableHead> */}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array(5).fill(0).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-6 w-8"/></TableCell>
                  <TableCell><Skeleton className="h-6 w-16"/></TableCell>
                  <TableCell><Skeleton className="h-6 w-24"/></TableCell>
                  <TableCell><Skeleton className="h-6 w-20"/></TableCell>
                  <TableCell><Skeleton className="h-6 w-20"/></TableCell>
                  <TableCell><Skeleton className="h-6 w-24"/></TableCell>
                  {/* <TableCell><Skeleton className="h-6 w-20"/></TableCell> */}
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4">
                  No orders found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((o) => (
                <TableRow key={o.id} className="align-middle">
                  <TableCell>{o.id}</TableCell>
                  <TableCell>{o.amount}</TableCell>
                  <TableCell>{o?.users?.name}</TableCell>
                  <TableCell>{o.payment_method}</TableCell>
                  <TableCell>{o.status}</TableCell>
                  <TableCell>{new Date(o.created_at).toLocaleString()}</TableCell>
                  {/* <TableCell className="space-x-2">
                    <Button variant="outline" size="sm" onClick={() => openEdit(o)} disabled={isDeleting === o.id}>
                      Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(o.id)} disabled={isDeleting === o.id}>
                      {isDeleting === o.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : "Delete"}
                    </Button>
                  </TableCell> */}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* <OrderModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSave={handleSave}
        initialData={editingOrder || undefined}
        isSaving={isSaving}
      /> */}
    </div>
  );
}
