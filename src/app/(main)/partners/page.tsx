'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  School, 
  MapPin, 
  Search, 
  Phone, 
  Mail, 
  UserCircle,
  Briefcase
} from 'lucide-react';

interface PartnerStore {
  id: number;
  name: string;
  roadAddress: string;
  detailAddress: string;
}

interface PartnerSchool {
  id: number;
  schoolName: string;
  yearMonth: string;
  status: string;
  _count: {
    students: number;
  }
}

interface Partner {
  id: number;
  loginId: string;
  name: string;
  phoneNumber: string | null;
  email: string;
  createdAt: string;
  stores: PartnerStore[];
  schools: PartnerSchool[];
}

function formatYearMonth(ym: string): string {
  if (!ym) return ym;
  if (ym.length === 5) {
    return `${ym.slice(0, 4)}년 ${ym.slice(4)}학기`;
  }
  if (ym.length === 6) {
    return `${ym.slice(0, 4)}년 ${ym.slice(4)}월`;
  }
  return ym;
}

export default function PartnersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    
    // Only allow ADMIN
    if (status === 'authenticated') {
      if (session?.user?.role !== 'ADMIN') {
        router.push('/');
        return;
      }
      fetchPartners();
    }
  }, [status, session, router]);

  const fetchPartners = async () => {
    try {
      const response = await fetch('/api/partners');
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || '파트너 목록 조회 실패');
      setPartners(data);
    } catch (error) {
      console.error('Error fetching partners:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#4B0082' }} />
      </div>
    );
  }

  // 통합 검색 로직 (계정, 이름, 전화, 지역(주소) 기준)
  const filteredPartners = partners.filter(p => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase().trim();
    
    const matchAccount = p.loginId.toLowerCase().includes(query) || p.email.toLowerCase().includes(query);
    const matchName = p.name.toLowerCase().includes(query);
    const matchPhone = p.phoneNumber?.replace(/-/g, '').includes(query.replace(/-/g, ''));
    
    // 지역 검색: 스토어 중 도로명 주소나 매장명에 쿼리가 포함되어 있는지 여부
    const matchRegion = p.stores.some(store => 
      store.roadAddress.toLowerCase().includes(query) || 
      store.detailAddress.toLowerCase().includes(query) ||
      store.name.toLowerCase().includes(query)
    );

    return matchAccount || matchName || matchPhone || matchRegion;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 w-full">
      {/* 헤더 및 검색바 */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900 flex items-center gap-3">
             <Briefcase className="w-8 h-8 text-purple-700" />
             파트너 관리
          </h1>
          <p className="text-gray-500 mt-2 font-medium">가입된 파트너 계정과 등록된 매장, 학교 현황을 한눈에 관리하세요.</p>
        </div>
        
        <div className="relative w-full md:w-96 shrink-0">
          <Input 
            type="text"
            placeholder="이름, 계정, 전화번호 또는 지역 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11 h-12 bg-white rounded-xl border-gray-200 shadow-sm focus:ring-purple-500 font-medium"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
      </div>

      {/* 종합 통계 카드 (옵션) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         <Card className="border-none shadow-sm shadow-purple-100 bg-white">
            <CardContent className="p-6 flex items-center justify-between">
               <div>
                  <p className="text-sm font-bold text-gray-500 mb-1">총 파트너</p>
                  <p className="text-3xl font-black text-purple-900">{filteredPartners.length}명</p>
               </div>
               <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center">
                  <UserCircle className="w-6 h-6 text-purple-600" />
               </div>
            </CardContent>
         </Card>
      </div>

      {/* 파트너 리스트 */}
      <div className="space-y-6">
        {filteredPartners.length > 0 ? filteredPartners.map((partner) => (
          <Card key={partner.id} className="border border-gray-100 shadow-lg shadow-gray-200/40 overflow-hidden hover:border-purple-200 transition-colors">
            <div className="flex flex-col lg:flex-row">
              {/* === 파트너 정보 (왼쪽) === */}
              <div className="p-6 bg-gray-50/50 lg:w-1/4 border-b lg:border-b-0 lg:border-r border-gray-100 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-4">
                   <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-700">
                     <UserCircle className="w-7 h-7" />
                   </div>
                   <div>
                     <h2 className="text-lg font-black text-gray-900">{partner.name}</h2>
                     <p className="text-xs text-gray-500 font-bold font-mono">{partner.loginId}</p>
                   </div>
                </div>
                
                <div className="space-y-2 mt-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                    <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="truncate">{partner.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                    <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                    <span>{partner.phoneNumber || '미등록'}</span>
                  </div>
                </div>
              </div>

              {/* === 업체 정보 (중앙) === */}
              <div className="p-6 lg:w-1/3 border-b lg:border-b-0 lg:border-r border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-700 flex items-center gap-2 text-sm">
                    <Building2 className="w-4 h-4 text-emerald-600" /> 보유 매장
                  </h3>
                  <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-none">
                    {partner.stores.length}개
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  {partner.stores.length > 0 ? partner.stores.map(store => (
                    <div key={store.id} className="bg-white border border-gray-100 p-3 rounded-xl shadow-sm">
                      <p className="font-bold text-sm text-gray-800 mb-1">{store.name}</p>
                      <div className="flex items-start gap-1.5 text-xs text-gray-500">
                        <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-gray-400" />
                        <span className="leading-tight">{store.roadAddress} {store.detailAddress}</span>
                      </div>
                    </div>
                  )) : (
                    <p className="text-center text-xs text-gray-400 py-4 bg-gray-50 rounded-lg">등록된 매장이 없습니다.</p>
                  )}
                </div>
              </div>

              {/* === 학교 정보 (오른쪽) === */}
              <div className="p-6 lg:w-[41.666%] bg-white">
                <div className="flex items-center justify-between mb-4">
                   <h3 className="font-bold text-gray-700 flex items-center gap-2 text-sm">
                     <School className="w-4 h-4 text-blue-600" /> 관리 중인 학교
                   </h3>
                   <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-50 border-none">
                     {partner.schools.length}개
                   </Badge>
                </div>

                {partner.schools.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                    {partner.schools.map((school, i) => (
                      <div key={i} className="flex flex-col gap-2 p-3 rounded-xl bg-gray-50 border border-gray-100 hover:border-blue-200 transition-colors">
                        <div className="flex justify-between items-start gap-2">
                           <div>
                             <p className="text-[10px] text-gray-400 font-bold mb-0.5">{formatYearMonth(school.yearMonth)}</p>
                             <p className="text-sm font-bold text-gray-800 leading-snug">{school.schoolName}</p>
                           </div>
                           <Badge variant="outline" className={`text-[10px] px-1.5 py-0 border-none font-bold shrink-0 ${school.status === 'active' ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-500'}`}>
                             {school.status === 'active' ? '진행중' : '마감'}
                           </Badge>
                        </div>
                        <div className="flex justify-between items-center mt-1 pt-2 border-t border-gray-200/60">
                           <span className="text-[11px] text-gray-500 font-medium">배정 인원</span>
                           <span className="text-xs font-black text-blue-700">{school._count.students}명</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <School className="w-8 h-8 text-gray-300 mb-2" />
                    <p className="text-sm text-gray-400 font-medium">관리 중인 학교가 없습니다.</p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        )) : (
          <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-gray-200">
            <UserCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900">결과를 찾을 수 없습니다</h3>
            <p className="text-gray-500 text-sm mt-1">검색어를 수정하거나 등록된 파트너가 있는지 확인하세요.</p>
          </div>
        )}
      </div>
    </div>
  );
}
