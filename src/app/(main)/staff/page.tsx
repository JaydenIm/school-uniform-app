'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Users, CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react';

interface Staff {
  id: number;
  name: string;
  email: string;
  phoneNumber: string | null;
  staffStatus: 'pending' | 'active' | 'resigned';
  createdAt: string;
}

export default function StaffManagementPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [staffs, setStaffs] = useState<Staff[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    
    // Allow PARTNER and ADMIN to view staff
    if (status === 'authenticated') {
      if (session?.user?.role !== 'PARTNER' && session?.user?.role !== 'ADMIN') {
        router.push('/');
        return;
      }
      fetchStaff();
    }
  }, [status, session, router]);

  const fetchStaff = async () => {
    try {
      const response = await fetch('/api/staff');
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || '직원 목록 조회 실패');
      setStaffs(data);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (staffId: number, action: 'approve' | 'resign') => {
    if (action === 'resign' && !window.confirm('정말 이 직원을 퇴사 처리하시겠습니까? (접근 권한이 즉시 정지됩니다)')) return;
    
    try {
      const res = await fetch('/api/staff', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staffId, action })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || '상태 변경에 실패했습니다.');
      
      toast.success(action === 'approve' ? '직원이 승인되었습니다.' : '직원이 퇴사 처리되었습니다.');
      // 목록 새로고침
      fetchStaff();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#4B0082' }} />
      </div>
    );
  }

  const getStatusBadge = (staffStatus: string) => {
    switch (staffStatus) {
      case 'active':
        return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none px-3 py-1"><CheckCircle className="w-3 h-3 mr-1" /> 승인됨(정상)</Badge>;
      case 'resigned':
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none px-3 py-1"><XCircle className="w-3 h-3 mr-1" /> 퇴사 / 차단</Badge>;
      case 'pending':
      default:
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-none px-3 py-1"><Clock className="w-3 h-3 mr-1" /> 승인 대기중</Badge>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 w-full animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900 flex items-center gap-3">
             <Users className="w-8 h-8 text-purple-700" />
             직원 및 권한 관리
          </h1>
          <p className="text-gray-500 mt-2 font-medium">파트너 코드로 가입한 직원을 승인하거나 권한을 회수합니다.</p>
        </div>
      </div>

      <div className="space-y-4">
        {staffs.length > 0 ? staffs.map((staff) => (
          <Card key={staff.id} className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-0">
               <div className="flex flex-col md:flex-row items-center justify-between p-6 gap-6">
                  {/* 왼쪽 기본 정보 */}
                  <div className="flex items-center gap-4 flex-1">
                     <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl
                        ${staff.staffStatus === 'active' ? 'bg-emerald-500' 
                          : staff.staffStatus === 'resigned' ? 'bg-gray-300' : 'bg-yellow-500'}`}
                     >
                       {staff.name.charAt(0)}
                     </div>
                     <div>
                       <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-lg text-gray-900">{staff.name}</h3>
                          {getStatusBadge(staff.staffStatus)}
                       </div>
                       <p className="text-sm text-gray-500 font-medium">{staff.email} <span className="mx-2 text-gray-300">|</span> {staff.phoneNumber || '전화번호 미등록'}</p>
                     </div>
                  </div>
                  
                  {/* 오른쪽 액션 버튼 */}
                  <div className="flex gap-2">
                     {staff.staffStatus !== 'active' && (
                        <Button 
                           onClick={() => handleStatusChange(staff.id, 'approve')}
                           className="bg-purple-700 hover:bg-purple-800 text-white shadow-sm"
                        >
                           <CheckCircle className="w-4 h-4 mr-2" /> 승인하기
                        </Button>
                     )}
                     {staff.staffStatus !== 'resigned' && (
                        <Button 
                           variant="outline"
                           onClick={() => handleStatusChange(staff.id, 'resign')}
                           className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 shadow-sm"
                        >
                           <XCircle className="w-4 h-4 mr-2" /> 퇴사 처리
                        </Button>
                     )}
                  </div>
               </div>
            </CardContent>
          </Card>
        )) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
            <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-900">연동 대기 중인 직원이 없습니다</h3>
            <p className="text-gray-500 text-sm mt-1">프로필 메뉴에서 <b>'소속 파트너 코드'</b>를 복사하여 직원에게 가입 시 입력하도록 안내해 주세요.</p>
          </div>
        )}
      </div>
    </div>
  );
}
