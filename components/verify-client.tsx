'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function VerifyClient() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [message, setMessage] = useState('Đang xác minh...');
  const [error, setError] = useState('');

  console.log('token', token);

  useEffect(() => {
    if (!token) {
      setError('Thiếu mã xác minh');
      return;
    }

    const verifyEmail = async () => {
      try {
        const res = await fetch(`/api/verify?token=${token}`);
        const data = await res.json();
        if (res.ok) {
          setMessage(data.message === 'Email already verified' ? 'Email đã được xác minh' : 'Email xác minh thành công');
        } else {
          setError(data.error || 'Xác minh thất bại');
        }
      } catch (err: unknown) {
        console.error(err);
        setError('Đã xảy ra lỗi trong quá trình xác minh');
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="max-w-md mx-auto min-h-[60vh] mt-20 space-y-4">
      <h1 className="text-xl font-bold text-center">Xác minh Email</h1>
      {message && <p className="text-sm text-green-600">{message}</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}
      <p className="text-sm text-center">
        <Button asChild>
          <Link href="/sign-in" className="text-white hover:underline">
            Đi đến Đăng nhập
          </Link>
        </Button>
      </p>
    </div>
  );
}
