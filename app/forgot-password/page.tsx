'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleResetPassword = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    setFieldErrors({});
    setIsLoading(true);

    const errors: typeof fieldErrors = {};

    if (!email) {
      errors.email = 'Email không được bỏ trống';
    } else if (!validateEmail(email)) {
      errors.email = 'Email không hợp lệ';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setIsLoading(false);
      return;
    }

    try {
      console.log('Sending request to /api/forgot-password with:', { email });
      const res = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      console.log('Response status:', res.status);
      const data = await res.json();
      console.log('Response data:', data);

      if (res.ok) {
        setSuccessMsg('Liên kết đặt lại mật khẩu đã được gửi đến email của bạn.');
      } else {
        setErrorMsg(data.error || 'Không thể gửi yêu cầu đặt lại mật khẩu.');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      setErrorMsg('Lỗi kết nối. Vui lòng kiểm tra mạng hoặc thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-[60vh] mt-20 space-y-4">
      <h1 className="text-xl font-bold text-center">Quên mật khẩu</h1>
      <p className="text-sm text-center">
        Nhập email của bạn để nhận liên kết đặt lại mật khẩu.
      </p>

      <div className="space-y-1">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {fieldErrors.email && (
          <p className="text-sm text-red-500">{fieldErrors.email}</p>
        )}
      </div>

      {errorMsg && <p className="text-sm text-red-500">{errorMsg}</p>}
      {successMsg && <p className="text-sm text-green-500">{successMsg}</p>}

      <Button
        className="w-full"
        onClick={handleResetPassword}
        disabled={isLoading}
      >
        {isLoading ? 'Đang gửi...' : 'Gửi liên kết đặt lại'}
      </Button>

      <p className="text-sm text-center">
        Quay lại{' '}
        <Link href="/sign-in" className="text-blue-500 hover:underline">
          Đăng nhập
        </Link>
      </p>
    </div>
  );
}