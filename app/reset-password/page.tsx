'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useRouter,useSearchParams } from 'next/navigation';



export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{
    password?: string;
    confirmPassword?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);

  
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  const handleResetPassword = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    setFieldErrors({});
    setIsLoading(true);

    const errors: typeof fieldErrors = {};

    if (!password) {
      errors.password = 'Mật khẩu không được bỏ trống';
    } else if (password.length < 8) {
      errors.password = 'Mật khẩu phải có ít nhất 8 ký tự';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
    } else if (confirmPassword !== password) {
      errors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setIsLoading(false);
      return;
    }
    console.log('Field errors:', password);
    try {
      console.log('Sending request to /api/reset-password with:', { password });
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({password, email }),
      });

      console.log('Response status:', res.status);
      const data = await res.json();
      console.log('Response data:', data);

      if (res.ok) {
        setSuccessMsg('Mật khẩu đã được đặt lại thành công. Vui lòng đăng nhập.');
        setTimeout(() => router.push('/sign-in'), 3000); // Redirect after 3s
      } else {
        setErrorMsg(data.error || 'Không thể đặt lại mật khẩu.');
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
      <h1 className="text-xl font-bold text-center">Đặt lại mật khẩu</h1>
      <p className="text-sm text-center">
        Nhập mật khẩu mới cho tài khoản của bạn.
      </p>

      <div className="space-y-1">
        <Label htmlFor="password">Mật khẩu mới</Label>
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

      <div className="space-y-1">
        <Label htmlFor="confirm-password">Xác nhận mật khẩu</Label>
        <Input
          id="confirm-password"
          type="password"
          placeholder="********"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        {fieldErrors.confirmPassword && (
          <p className="text-sm text-red-500">{fieldErrors.confirmPassword}</p>
        )}
      </div>

      {errorMsg && <p className="text-sm text-red-500">{errorMsg}</p>}
      {successMsg && <p className="text-sm text-green-500">{successMsg}</p>}

      <Button
        className="w-full"
        onClick={handleResetPassword}
        disabled={isLoading }
      >
        {isLoading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
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