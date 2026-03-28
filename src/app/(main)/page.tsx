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
  const [boards, setBoards] = useState<any[]>([]);
  const [isLoadingBids, setIsLoadingBids] = useState(true);
  const [isLoadingBoards, setIsLoadingBoards] = useState(true);

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
      fetchBoards();
    }
  }, [status, session, router]);

  const fetchNaraBids = async () => {
    try {
      const response = await fetch('/api/nara');
      const result = await response.json();
      if (result.success) {
        setNaraBids(result.data.slice(0, 4)); // 사이드바에서는 4개 정도만 노출
      }
    } catch (error) {
      console.error('Error fetching bids:', error);
    } finally {
      setIsLoadingBids(false);
    }
  };

  const fetchBoards = async () => {
    try {
      const response = await fetch('/api/boards?limit=6');
      if (response.ok) {
        const data = await response.json();
        setBoards(data);
      }
    } catch (error) {
      console.error('Error fetching boards:', error);
    } finally {
      setIsLoadingBoards(false);
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
    <div className="flex-1 space-y-6">
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
           <Button variant="outline" className="rounded-xl border-gray-200 h-11 px-6 font-bold hover:bg-white" onClick={() => { fetchNaraBids(); fetchBoards(); }}>
              <Clock className="mr-2 w-4 h-4" /> 새로고침
           </Button>
           <Button className="bg-purple-800 text-white rounded-xl h-11 px-6 font-bold hover:bg-purple-900 shadow-lg shadow-purple-200" onClick={() => router.push('/schools')}>
              <ClipboardList className="mr-2 w-4 h-4" /> 현황 상세 보기
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 파트너 공지사항 (2/3 영역) */}
        <Card className="lg:col-span-2 border-none shadow-xl shadow-gray-200/50 bg-white overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between bg-white border-b border-gray-50 pb-6 pt-7 px-8">
            <div className="space-y-1.5">
              <CardTitle className="text-xl font-black flex items-center gap-2">
                <Building2 className="w-5 h-5 text-purple-700" /> 온핏 파트너 공지사항
              </CardTitle>
              <CardDescription className="text-gray-400 font-medium tracking-tight">
                전체 파트너사에게 전달되는 중요 공지사항과 시스템 정보를 확인하세요.
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {session?.user?.role === 'ADMIN' && (
                <Button variant="outline" size="sm" className="text-gray-600 font-bold border-gray-200 rounded-lg" onClick={() => router.push('/notices/write')}>
                  공지 작성
                </Button>
              )}
              <Button variant="ghost" size="sm" className="text-purple-600 font-bold hover:bg-purple-50 group" onClick={() => router.push('/notices')}>
                전체 보기 <ChevronRight className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              {isLoadingBoards ? (
                <div className="flex flex-col items-center justify-center h-[400px] text-gray-400">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-800 mb-4" />
                  <p className="font-medium">공지사항을 불러오는 중입니다...</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50 px-8 py-2">
                  {boards.length > 0 ? boards.map((board) => (
                    <div 
                      key={board.id} 
                      className="group py-5 flex items-center justify-between cursor-pointer hover:translate-x-1 transition-all duration-200"
                      onClick={() => router.push(`/notices/${board.id}`)}
                    >
                      <div className="space-y-1.5 flex-1 pr-10">
                        <div className="flex items-center gap-2">
                           <Badge className="bg-purple-50 text-purple-600 border-none font-bold text-[10px] px-1.5 h-5">공지</Badge>
                           <p className="font-bold text-gray-800 leading-snug group-hover:text-purple-800 transition-colors">
                            {board.title}
                           </p>
                        </div>
                        <p className="text-[11px] text-gray-400 font-medium leading-tight line-clamp-1">
                          {board.content.replace(/<[^>]*>?/gm, '')}
                        </p>
                      </div>
                      <div className="flex items-center gap-6 text-right shrink-0">
                        <div className="space-y-0.5">
                           <p className="text-[11px] font-bold text-gray-500">{new Date(board.createdAt).toLocaleDateString()}</p>
                           <p className="text-[10px] text-gray-300 font-medium">관리자</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-200 group-hover:text-purple-300 transition-colors" />
                      </div>
                    </div>
                  )) : (
                    <div className="flex flex-col items-center justify-center h-[400px] text-gray-400">
                      <p className="font-medium">등록된 공지사항이 없습니다.</p>
                      {session?.user?.role === 'ADMIN' && (
                        <Button variant="ghost" size="sm" className="mt-4 text-purple-600" onClick={() => router.push('/notices/write')}>
                          첫 번째 공지 작성하기
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 오른쪽 사이드 영역: 나라장터 축소 버전 */}
        <div className="space-y-6">
          <Card className="border-none shadow-xl shadow-gray-200/50 bg-white">
            <CardHeader className="pb-3 border-b border-gray-50 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-black flex items-center gap-2">
                 <Gavel className="w-4 h-4 text-purple-700" /> 최근 입찰 공고
              </CardTitle>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-300 hover:text-purple-600" onClick={() => window.open('https://www.g2b.go.kr', '_blank')}>
                <ArrowUpRight className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
               {isLoadingBids ? (
                 <div className="flex justify-center p-8">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-800" />
                 </div>
               ) : (
                 naraBids.map((bid, i) => (
                   <div key={i} className="space-y-1 group cursor-pointer" onClick={() => window.open(bid.url, '_blank')}>
                      <p className="text-xs font-bold text-gray-700 group-hover:text-purple-700 transition-colors line-clamp-1">{bid.bidNtceNm}</p>
                      <div className="flex justify-between items-center text-[10px] text-gray-400 font-medium">
                         <span>{bid.ntceInstNm}</span>
                         <span className={bid.status === '마감임박' ? 'text-red-500 font-bold' : ''}>{bid.bidEndDate.split(' ')[0]}</span>
                      </div>
                   </div>
                 ))
               )}
               <Button variant="ghost" className="w-full mt-2 h-10 text-xs font-bold text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-xl" onClick={() => window.open('https://www.g2b.go.kr', '_blank')}>
                  나라장터 바로가기
               </Button>
            </CardContent>
          </Card>

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
               <p className="text-sm text-white/50 font-medium leading-relaxed italic">"신규 계약 문의가 순조롭게 상승 중입니다."</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}