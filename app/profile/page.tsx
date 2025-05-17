"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.newPassword !== form.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
    const user = JSON.parse(localStorage.getItem("ecom_user") || "{}");;

      const res = await fetch("/api/users/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Cập nhật thất bại");
        return;
      }

      setSuccess("Đổi mật khẩu thành công.");
      setForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">Đổi mật khẩu</h1>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      {success && <p className="text-green-600 text-sm mb-4">{success}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            className="block text-sm font-medium mb-1"
            htmlFor="currentPassword"
          >
            Mật khẩu hiện tại
          </label>
          <Input
            id="currentPassword"
            name="currentPassword"
            type="password"
            value={form.currentPassword}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label
            className="block text-sm font-medium mb-1"
            htmlFor="newPassword"
          >
            Mật khẩu mới
          </label>
          <Input
            id="newPassword"
            name="newPassword"
            type="password"
            value={form.newPassword}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label
            className="block text-sm font-medium mb-1"
            htmlFor="confirmPassword"
          >
            Xác nhận mật khẩu
          </label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>

        <Button type="submit" disabled={loading}>
          {loading ? "Đang lưu..." : "Đổi mật khẩu"}
        </Button>
      </form>
    </div>
  );
}
