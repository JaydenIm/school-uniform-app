'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function SignUpPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('비밀번호가 일치하지 않습니다.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || '회원가입에 실패했습니다.');
      }

      toast.success('회원가입이 완료되었습니다.');
      router.push('/login');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* 왼쪽: 검은색 배경 섹션 */}
      <div className="hidden lg:flex lg:w-1/2 bg-black items-center justify-center">
        <div className="max-w-md text-white text-center">
          <h1 className="text-4xl font-bold mb-6">School Uniform</h1>
          <p className="text-lg text-gray-400">
            교복 관리 시스템에 오신 것을 환영합니다
          </p>
        </div>
      </div>

      {/* 오른쪽: 회원가입 폼 */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm space-y-8">
          <div className="space-y-2 text-center">
            <h2 className="text-3xl font-bold">회원가입</h2>
            <p className="text-gray-500">
              새로운 계정을 만들어보세요
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">이름</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="phoneNumber">전화번호</Label>
                <Input
                  id="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="password">비밀번호</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="confirmPassword">비밀번호 확인</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-black hover:bg-gray-900 text-white"
              disabled={isLoading}
            >
              {isLoading ? '처리 중...' : '회원가입'}
            </Button>

            <div className="text-center">
              <p className="text-sm text-gray-500">
                이미 계정이 있으신가요?{' '}
                <Link href="/login" className="text-black hover:underline font-semibold">
                  로그인
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 