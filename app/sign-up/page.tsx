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

  const signup = async () => {
    setErrorMsg('');
    setSuccessMsg('');

    if (!email || !password) {
      setErrorMsg('Email và mật khẩu là bắt buộc');
      return;
    }

    const res = await fetch('/api/sign-up', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      setSuccessMsg('Tạo tài khoản thành công! Bạn có thể đăng nhập.');
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
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Mật khẩu</Label>
        <Input
          id="password"
          type="password"
          placeholder="********"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
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
