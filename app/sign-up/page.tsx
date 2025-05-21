'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const signup = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    setFieldErrors({});

    const errors: typeof fieldErrors = {};

    if (!email) {
      errors.email = 'Email không được để trống';
    } else if (!validateEmail(email)) {
      errors.email = 'Email không hợp lệ';
    }

    if (!password) {
      errors.password = 'Mật khẩu không được để trống';
    } else if (password.length < 8) {
      errors.password = 'Mật khẩu phải có ít nhất 8 ký tự';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: email, email, password, role: 'CUSTOMER' }),
    });

    const data = await res.json();

    if (res.ok) {
      setSuccessMsg('Đăng ký thành công! Vui lòng kiểm tra email để xác minh tài khoản.');
      setEmail('');
      setPassword('');
    } else {
      setErrorMsg(data.error || 'Đăng ký thất bại');
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-[60vh] mt-20 space-y-4">
      <h1 className="text-xl font-bold text-center">Đăng ký</h1>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setFieldErrors((prev) => ({ ...prev, email: undefined }));
            setErrorMsg('');
            setSuccessMsg('');
          }}
        />
        {fieldErrors.email && <p className="text-sm text-red-500">{fieldErrors.email}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Mật khẩu</Label>
        <Input
          id="password"
          type="password"
          placeholder="********"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setFieldErrors((prev) => ({ ...prev, password: undefined }));
            setErrorMsg('');
            setSuccessMsg('');
          }}
        />
        {fieldErrors.password && <p className="text-sm text-red-500">{fieldErrors.password}</p>}
      </div>

      {errorMsg && <p className="text-sm text-red-500">{errorMsg}</p>}
      {successMsg && <p className="text-sm text-green-600">{successMsg}</p>}

      <Button className="w-full" onClick={signup}>
        Đăng ký
      </Button>

      <p className="text-sm text-center">
        Đã có tài khoản?{' '}
        <Link href="/sign-in" className="text-blue-500 hover:underline">
          Đăng nhập
        </Link>
      </p>
    </div>
  );
}