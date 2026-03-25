'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error('이메일 또는 비밀번호가 일치하지 않습니다.');
        return;
      }

      if (result?.ok) {
        toast.success('로그인 성공');
        router.push('/');
        router.refresh();
      }
    } catch (error) {
      toast.error('로그인 중 오류가 발생했습니다.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm space-y-8">
      {/* 헤더 */}
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-bold text-gray-900">로그인</h2>
        <p className="text-gray-500 text-sm">
          계정 정보를 입력하여 로그인하세요
        </p>
      </div>

      {/* 폼 */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">이메일</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required
              className="h-11 border-gray-200 focus:border-brand-primary focus:ring-brand-primary"
              style={{ '--tw-ring-color': '#4B0082' } as React.CSSProperties}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-sm font-medium text-gray-700">비밀번호</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              required
              className="h-11 border-gray-200"
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-11 text-white font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-purple-200"
          style={{
            background: isLoading ? '#6A0DAD' : 'linear-gradient(135deg, #4B0082, #6A0DAD)',
          }}
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              로그인 중...
            </span>
          ) : '로그인'}
        </Button>
      </form>

      <div className="text-center">
        <p className="text-sm text-gray-500">
          계정이 없으신가요?{' '}
          <Link href="/signup" className="font-semibold hover:underline" style={{ color: '#4B0082' }}>
            회원가입
          </Link>
        </p>
      </div>
    </div>
  );
}