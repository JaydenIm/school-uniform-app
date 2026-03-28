'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eye, EyeOff, CheckCircle2, Circle } from 'lucide-react';

/** 비밀번호 강도 조건 */
const pwRules = [
  { label: '8자 이상', test: (pw: string) => pw.length >= 8 },
  { label: '영문 포함', test: (pw: string) => /[a-zA-Z]/.test(pw) },
  { label: '숫자 포함', test: (pw: string) => /\d/.test(pw) },
];

/** 전화번호 자동 하이픈 포맷 */
function formatPhone(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

export default function SignUpPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    partnerCode: '',
  });

  const passwordMatch = formData.confirmPassword
    ? formData.password === formData.confirmPassword
    : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('비밀번호가 일치하지 않습니다.');
      return;
    }
    if (pwRules.some(r => !r.test(formData.password))) {
      toast.error('비밀번호 조건을 모두 충족해 주세요.');
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
      if (!response.ok) throw new Error(data.message || '회원가입에 실패했습니다.');

      toast.success('회원가입이 완료되었습니다. 로그인 해주세요!');
      router.push('/login');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm space-y-7">
      {/* 헤더 */}
      <div className="space-y-1 text-center">
        <h2 className="text-3xl font-bold text-gray-900">회원가입</h2>
        <p className="text-sm text-gray-500">OnFit 계정을 만들어 시작하세요</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 이름 */}
        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-sm font-medium text-gray-700">
            이름 <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            placeholder="홍길동"
            value={formData.name}
            onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
            className="h-11"
            required
          />
        </div>

        {/* 이메일 */}
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-sm font-medium text-gray-700">
            이메일 <span className="text-red-500">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            value={formData.email}
            onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
            className="h-11"
            required
          />
        </div>

        {/* 전화번호 */}
        <div className="space-y-1.5">
          <Label htmlFor="phoneNumber" className="text-sm font-medium text-gray-700">
            전화번호
          </Label>
          <Input
            id="phoneNumber"
            type="tel"
            placeholder="010-0000-0000"
            value={formData.phoneNumber}
            onChange={(e) => setFormData(p => ({ ...p, phoneNumber: formatPhone(e.target.value) }))}
            className="h-11"
            maxLength={13}
          />
        </div>

        {/* 파트너 고유 코드 (선택) */}
        <div className="space-y-1.5 pb-2 border-b border-gray-100 mb-2">
          <Label htmlFor="partnerCode" className="text-sm font-medium text-purple-700 flex items-center gap-1">
            소속 파트너 코드 <span className="text-xs text-gray-400 font-normal">(선택)</span>
          </Label>
          <Input
            id="partnerCode"
            type="text"
            placeholder="직원으로 가입 시 코드 입력 (예: OFT-XXXX)"
            value={formData.partnerCode}
            onChange={(e) => setFormData(p => ({ ...p, partnerCode: e.target.value.toUpperCase() }))}
            className="h-11 border-purple-200 focus:border-purple-500 bg-purple-50/30"
          />
        </div>

        {/* 비밀번호 */}
        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-sm font-medium text-gray-700">
            비밀번호 <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPw ? 'text' : 'password'}
              placeholder="8자 이상, 영문+숫자 조합"
              value={formData.password}
              onChange={(e) => setFormData(p => ({ ...p, password: e.target.value }))}
              className="h-11 pr-10"
              required
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={() => setShowPw(v => !v)}
              tabIndex={-1}
            >
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* 비밀번호 강도 표시 */}
          {formData.password && (
            <div className="flex gap-3 pt-1">
              {pwRules.map(rule => {
                const passed = rule.test(formData.password);
                return (
                  <span key={rule.label} className={`flex items-center gap-1 text-xs transition-colors ${passed ? 'text-green-600' : 'text-gray-400'}`}>
                    {passed
                      ? <CheckCircle2 className="w-3 h-3" />
                      : <Circle className="w-3 h-3" />
                    }
                    {rule.label}
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* 비밀번호 확인 */}
        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
            비밀번호 확인 <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPw ? 'text' : 'password'}
              placeholder="비밀번호를 다시 입력하세요"
              value={formData.confirmPassword}
              onChange={(e) => setFormData(p => ({ ...p, confirmPassword: e.target.value }))}
              className={`h-11 pr-10 transition-colors ${
                passwordMatch === true
                  ? 'border-green-400 focus:border-green-500'
                  : passwordMatch === false
                  ? 'border-red-400 focus:border-red-500'
                  : ''
              }`}
              required
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={() => setShowConfirmPw(v => !v)}
              tabIndex={-1}
            >
              {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {passwordMatch === false && (
            <p className="text-xs text-red-500 mt-1">비밀번호가 일치하지 않습니다</p>
          )}
          {passwordMatch === true && (
            <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> 비밀번호가 일치합니다
            </p>
          )}
        </div>

        {/* 제출 버튼 */}
        <Button
          type="submit"
          className="w-full h-11 text-white font-semibold mt-2 hover:opacity-90 transition-all"
          style={{ background: isLoading ? '#6A0DAD' : 'linear-gradient(135deg, #4B0082, #6A0DAD)' }}
          disabled={isLoading || passwordMatch === false}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              처리 중...
            </span>
          ) : '가입하기'}
        </Button>
      </form>

      {/* 로그인 이동 */}
      <p className="text-center text-sm text-gray-500">
        이미 계정이 있으신가요?{' '}
        <Link href="/login" className="font-semibold hover:underline" style={{ color: '#4B0082' }}>
          로그인
        </Link>
      </p>
    </div>
  );
}