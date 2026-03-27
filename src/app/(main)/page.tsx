'use client';

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  Calendar, 
  Clock, 
  ExternalLink, 
  Gavel, 
  ListFilter, 
  School, 
  ArrowUpRight,
  ClipboardList,
  ChevronRight,
  TrendingUp,
  LayoutDashboard
} from "lucide-react";

interface NaraBid {
  id: string;
  bidNtceNm: string;
  ntceInstNm: string;
  bidMethodNm: string;
  bidEndDate: string;
  status: string;
  url: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [naraBids, setNaraBids] = useState<NaraBid[]>([]);
  const [isLoadingBids, setIsLoadingBids] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    } else if (status === 'authenticated') {
      const hasVisited = localStorage.getItem('hasVisitedDashboard');
      if (!hasVisited && session?.user?.name) {
        toast.success(`환영합니다, ${session.user.name}님!`);
        localStorage.setItem('hasVisitedDashboard', 'true');
      }
      fetchNaraBids();
    }
  }, [status, session, router]);

  const fetchNaraBids = async () => {
    try {
      const response = await fetch('/api/nara');
      const result = await response.json();
      if (result.success) {
        setNaraBids(result.data);
      }
    } catch (error) {
      console.error('Error fetching bids:', error);
    } finally {
      setIsLoadingBids(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-100px)]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-800" />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-8 bg-gray-50/50">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-1">
             <div className="p-2 bg-purple-100 rounded-lg">
                <LayoutDashboard className="w-5 h-5 text-purple-700" />
             </div>
             <p className="text-sm font-bold text-purple-700 uppercase tracking-widest">Global Dashboard</p>
          </div>
          <h2 className="text-3xl font-black tracking-tight text-gray-900">비즈니스 요약</h2>
          <p className="text-gray-500 font-medium">실시간 입찰 정보와 매장 운영 현황을 한눈에 확인하세요.</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" className="rounded-xl border-gray-200 h-11 px-6 font-bold hover:bg-white" onClick={fetchNaraBids}>
              <Clock className="mr-2 w-4 h-4" /> 새로고침
           </Button>
           <Button className="bg-purple-800 text-white rounded-xl h-11 px-6 font-bold hover:bg-purple-900 shadow-lg shadow-purple-200" onClick={() => router.push('/schools')}>
              <ClipboardList className="mr-2 w-4 h-4" /> 현황 상세 보기
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 나라장터 입찰 게시판 (2/3 영역) */}
        <Card className="lg:col-span-2 border-none shadow-xl shadow-gray-200/50 bg-white overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between bg-white border-b border-gray-50 pb-6 pt-7 px-8">
            <div className="space-y-1.5">
              <CardTitle className="text-xl font-black flex items-center gap-2">
                <Gavel className="w-5 h-5 text-purple-700" /> 나라장터 교복 입찰 공고
              </CardTitle>
              <CardDescription className="text-gray-400 font-medium tracking-tight">
                현재 진행 중인 전국의 중·고등학교 교복 구매 입찰 정보입니다.
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="text-purple-600 font-bold hover:bg-purple-50 group" onClick={() => window.open('https://www.g2b.go.kr', '_blank')}>
              전체 보기 <ArrowUpRight className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              {isLoadingBids ? (
                <div className="flex flex-col items-center justify-center h-[400px] text-gray-400">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-800 mb-4" />
                  <p className="font-medium">공고 정보를 불러오는 중입니다...</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50 border-b border-gray-50">
                      <th className="py-4 px-8 text-xs font-bold text-gray-400 uppercase tracking-wider">공고 내용</th>
                      <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">유형/기관</th>
                      <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">마감일</th>
                      <th className="py-4 px-8 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">상태</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {naraBids.map((bid) => (
                      <tr key={bid.id} className="group hover:bg-purple-50/30 transition-all duration-200">
                        <td className="py-5 px-8 max-w-md">
                          <div className="space-y-1">
                            <p className="font-bold text-gray-800 leading-snug group-hover:text-purple-800 transition-colors cursor-pointer line-clamp-2">
                              {bid.bidNtceNm}
                            </p>
                            <div className="flex items-center gap-3 text-[11px] text-gray-400 font-medium">
                              <span className="flex items-center gap-1"><ClipboardList className="w-3 h-3" /> {bid.id}</span>
                              <span className="flex items-center gap-1"><ListFilter className="w-3 h-3" /> {bid.bidMethodNm}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-5 px-6">
                           <div className="space-y-1">
                             <div className="flex items-center gap-1.5 text-xs font-black text-gray-700">
                                <School className="w-3.5 h-3.5 text-purple-400" />
                                <span>학교주관구매</span>
                             </div>
                             <p className="text-[11px] text-gray-400 font-medium leading-tight">
                               {bid.ntceInstNm}
                             </p>
                           </div>
                        </td>
                        <td className="py-5 px-6 text-[13px] font-bold text-gray-600">
                          <div className="flex items-center gap-2">
                             <Calendar className="w-3.5 h-3.5 text-gray-300" />
                             {bid.bidEndDate.split(' ')[0]}
                          </div>
                          <div className="text-[10px] text-gray-300 ml-5">
                             {bid.bidEndDate.split(' ')[1]}
                          </div>
                        </td>
                        <td className="py-5 px-8 text-right">
                          <Badge className={`px-2.5 py-0.5 rounded-full border-none font-black text-[11px] ${
                            bid.status === '마감임박' 
                              ? 'bg-red-100 text-red-600' 
                              : 'bg-emerald-100 text-emerald-600'
                          }`}>
                            {bid.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 오른쪽 사이드 영역 */}
        <div className="space-y-6">
          {/* 비즈니스 성능 요약 */}
          <Card className="border-none shadow-xl shadow-gray-200/50 bg-gradient-to-br from-purple-800 to-indigo-900 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-10">
               <TrendingUp className="w-32 h-32" />
            </div>
            <CardHeader className="pb-2 relative z-10">
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-white/60">Business Growth</CardTitle>
              <div className="flex items-baseline gap-2 mt-4">
                 <h2 className="text-4xl font-black">28.4%</h2>
                 <span className="text-sm font-bold text-emerald-400 flex items-center gap-0.5">
                    <ArrowUpRight className="w-4 h-4" /> +5.2%
                 </span>
              </div>
            </CardHeader>
            <CardContent className="pt-4 relative z-10">
               <p className="text-sm text-white/50 font-medium leading-relaxed">전월 대비 신규 계약 문의 및 측정 완료율이 상승하고 있습니다.</p>
               <div className="mt-8 space-y-4">
                  <div className="flex justify-between items-center text-xs font-bold">
                     <span className="text-white/60">측정 목표 달성도</span>
                     <span>82%</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                     <div className="h-full bg-emerald-400 rounded-full" style={{ width: '82%' }} />
                  </div>
               </div>
            </CardContent>
          </Card>

          {/* 공지사항 / 게시판 요약 */}
          <Card className="border-none shadow-xl shadow-gray-200/50 bg-white">
            <CardHeader className="pb-3 border-b border-gray-50 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-black flex items-center gap-2">
                 <Building2 className="w-4 h-4 text-purple-700" /> 파트너 공지사항
              </CardTitle>
              <ChevronRight className="w-4 h-4 text-gray-300" />
            </CardHeader>
            <CardContent className="pt-5 space-y-4">
               {[
                 { title: '온핏 시스템 보안 강화 점검 안내', date: '2024.03.27' },
                 { title: '2024년 상반기 교복 품질 기준 가이드', date: '2024.03.25' },
                 { title: '물류 센터 이전에 따른 배송 지연 안내', date: '2024.03.22' }
               ].map((item, i) => (
                 <div key={i} className="flex justify-between items-start group cursor-pointer">
                    <p className="text-xs font-bold text-gray-700 group-hover:text-purple-700 transition-colors line-clamp-1">{item.title}</p>
                    <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap ml-4">{item.date}</span>
                 </div>
               ))}
               <Button variant="ghost" className="w-full mt-2 h-10 text-xs font-bold text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-xl">
                  전체 보기
               </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}