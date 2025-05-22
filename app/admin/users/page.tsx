"use client";

import { useEffect, useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  created_at?: string;
}

function UserModal({
  open,
  onOpenChange,
  onSave,
  initialData,
  isSaving,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: User & { password?: string }) => void;
  initialData?: User;
  isSaving: boolean;
}) {
  const [formData, setFormData] = useState<User & { password?: string }>({
    id: initialData?.id || "",
    name: initialData?.name || "",
    email: initialData?.email || "",
    role: initialData?.role || "CUSTOMER",
    password: initialData?.password || "",
  });

  useEffect(() => {
    setFormData({
      id: initialData?.id || "",
      name: initialData?.name || "",
      email: initialData?.email || "",
      role: initialData?.role || "CUSTOMER",
      password: initialData?.password || "",
    });
  }, [initialData]);

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.name.trim()) return alert("Name is required");
    if (!formData.email.trim()) return alert("Email is required");
    if (!formData.role.trim()) return alert("Role is required");
    if (!formData.name.trim() && !formData.password.trim()) {
      return alert("Password is required for new users");
    }
    onSave(formData);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit User" : "Add User"}</DialogTitle>
          <DialogDescription>
            {initialData
              ? "Update user details below."
              : "Enter new user information."}
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

          <div>
            <label
              className="block text-sm font-medium mb-1"
              htmlFor="password"
            >
              Password {initialData ? "(Leave blank to keep unchanged)" : ""}
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={onChange}
              required={!initialData}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="role">
              Role
            </label>
            <Select
              value={formData.role}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, role: value }))
              }
            >
              <SelectTrigger id="role">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CUSTOMER">Customer</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : initialData ? (
                "Save Changes"
              ) : (
                "Add User"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    search: "",
    role: "",
  });

  function fetchUsers() {
    setIsLoading(true);
    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => setUsers(data || []))
      .catch((err) => console.error("Error fetching users:", err))
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    const searchMatch =
      user.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      user.email.toLowerCase().includes(filters.search.toLowerCase());
    const roleMatch = !filters.role || user.role === filters.role;
    return searchMatch && roleMatch;
  });

  function handleSave(user: User & { password?: string }) {
    setIsSaving(true);
    const isNew = !user.id;
    const url = isNew ? "/api/users" : `/api/users/${user.id}`;
    const method = isNew ? "POST" : "PUT";
    const payload = {
      ...user,
      id: isNew ? undefined : parseInt(user.id),
      password: (isNew || user?.password) ? user?.password : undefined
    };

    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to save user");
        return res.json();
      })
      .then((saved) => {
        setUsers((prev) =>
          isNew
            ? [...prev, saved.user]
            : prev.map((u) => (u.id === saved.user.id ? saved.user : u))
        );
        setModalOpen(false);
      })
      .catch((err) => {
        console.error("Error saving user:", err);
        alert("Failed to save user: " + err.message);
      })
      .finally(() => setIsSaving(false));
  }

  function openAdd() {
    setEditingUser(null);
    setModalOpen(true);
  }

  function openEdit(user: User) {
    setEditingUser(user);
    setModalOpen(true);
  }

  function handleDelete(id: string) {
    setIsDeleting(id);
    fetch(`/api/users/${id}`, { method: "DELETE" })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to delete user");
        setUsers((prev) => prev.filter((u) => u.id !== id));
      })
      .catch((err) => {
        console.error("Error deleting user:", err);
        alert("Failed to delete user: " + err.message);
      })
      .finally(() => setIsDeleting(null));
  }

  return (
    <div>
      <div className="flex flex-wrap justify-between mb-4 gap-2">
        <div className="flex flex-wrap gap-2">
          <Input
            className="w-full sm:w-[200px]"
            placeholder="Search by name or email..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
          <Select
            value={filters.role}
            onValueChange={(value) => setFilters({ ...filters, role: value })}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CUSTOMER">Customer</SelectItem>
              <SelectItem value="ADMIN">Admin</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => setFilters({ search: "", role: "" })}
          >
            Reset
          </Button>
        </div>
        <div className="flex gap-4">
          <Button size="sm" onClick={fetchUsers} disabled={isLoading}>
            Reload
          </Button>
          <Button size="sm" onClick={openAdd} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              "Add User"
            )}
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded border border-gray-300">
        <Table className="text-sm">
          <TableHeader className="bg-gray-200">
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array(5)
                .fill(0)
                .map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-4 w-12" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-32" />
                    </TableCell>
                  </TableRow>
                ))
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id} className="align-middle">
                  <TableCell>{user.id}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    {moment(user.created_at).format("DD/MM/YYYY HH:mm")}
                  </TableCell>
                  <TableCell className="space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEdit(user)}
                      disabled={isDeleting === user.id}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(user.id)}
                      disabled={isDeleting === user.id}
                    >
                      {isDeleting === user.id ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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

      <UserModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSave={handleSave}
        initialData={editingUser || undefined}
        isSaving={isSaving}
      />
    </div>
  );
}
