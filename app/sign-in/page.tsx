'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const login = async () => {
    setErrorMsg('');

    if (!email || !password) {
      setErrorMsg('Email và mật khẩu là bắt buộc');
      return;
    }

    const res = await fetch('/api/sign-in', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      alert('Đăng nhập thành công');
    } else {
      setErrorMsg(data.error || 'Đăng nhập thất bại');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 space-y-4">
      <h1 className="text-xl font-bold text-center">Đăng nhập</h1>

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

      {errorMsg && (
        <p className="text-sm text-red-500">{errorMsg}</p>
      )}

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
