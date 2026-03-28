'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from "@/components/ui/card";
import { Clock, ShieldAlert } from 'lucide-react';

export default function PendingPage() {
  const { data: session } = useSession();
  const router = useRouter();

  // If active staff or partner, redirect to home
  if (session?.user?.role !== 'STAFF' || session?.user?.staffStatus === 'active') {
    router.push('/');
    return null;
  }

  const isResigned = session?.user?.staffStatus === 'resigned';

  return (
    <div className="max-w-3xl mx-auto py-20 animate-in fade-in duration-500">
      <Card className="border-none shadow-xl bg-white rounded-3xl overflow-hidden">
        <CardContent className="p-12 text-center space-y-6">
          {isResigned ? (
            <>
              <div className="w-24 h-24 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShieldAlert className="w-12 h-12" />
              </div>
              <h1 className="text-3xl font-black tracking-tight text-gray-900">
                접근이 제한되었습니다
              </h1>
              <p className="text-lg text-gray-500 max-w-lg mx-auto leading-relaxed">
                현재 계정은 퇴사 처리되었거나 시스템 권한이 회수된 상태입니다.
                <br /> 권한과 관련한 문의는 대표 관리자(파트너)에게 연락해주시기 바랍니다.
              </p>
            </>
          ) : (
            <>
              <div className="w-24 h-24 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="w-12 h-12" />
              </div>
              <h1 className="text-3xl font-black tracking-tight text-gray-900">
                승인 대기 중입니다
              </h1>
              <p className="text-lg text-gray-500 max-w-lg mx-auto leading-relaxed">
                회원가입은 완료되었으나, 아직 소속 파트너의 승인이 이루어지지 않았습니다. 
                <br /> 파트너(대표)가 <b>[직원 관리]</b> 메뉴에서 가입을 승인하면 시스템을 이용하실 수 있습니다.
              </p>
            </>
          )}

          <div className="pt-8">
            <button 
              onClick={() => router.push('/profile')}
              className="font-bold text-purple-700 hover:text-purple-800 hover:underline"
            >
              내 프로필 정보 확인하기 &rarr;
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
