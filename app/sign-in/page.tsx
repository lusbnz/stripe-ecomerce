'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const login = async () => {
    setErrorMsg('');
    setFieldErrors({});

    const errors: typeof fieldErrors = {};

    if (!email) {
      errors.email = 'Email không được bỏ trống';
    } else if (!validateEmail(email)) {
      errors.email = 'Email không hợp lệ';
    }

    if (!password) {
      errors.password = 'Mật khẩu không được bỏ trống';
    } else if (password.length < 8) {
      errors.password = 'Mật khẩu phải có ít nhất 8 ký tự';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    const res = await fetch('/api/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      if (!data.user.is_verified) {
        setErrorMsg('Vui lòng xác minh email trước khi đăng nhập');
        return;
      }
      localStorage.setItem('ecom_user', JSON.stringify(data.user));
      router.push('/');
    } else {
      setErrorMsg(data.error || 'Đăng nhập thất bại');
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-[60vh] mt-20 space-y-4">
      <h1 className="text-xl font-bold text-center">Đăng nhập</h1>

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

      <div className="space-y-1">
        <Label htmlFor="password">Mật khẩu</Label>
        <Input
          id="password"
          type="password"
          placeholder="********"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {fieldErrors.password && (
          <p className="text-sm text-red-500">{fieldErrors.password}</p>
        )}
      </div>

      {errorMsg && <p className="text-sm text-red-500">{errorMsg}</p>}

      <Button className="w-full" onClick={login}>
        Đăng nhập
      </Button>

      <p className="text-sm text-center">
        Chưa có tài khoản?{' '}
        <Link href="/sign-up" className="text-blue-500 hover:underline">
          Đăng ký ngay
        </Link>
      </p>
    </div>
  );
}