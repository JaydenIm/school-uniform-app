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
  LayoutDashboard,
  Settings,
  Hash,
  Users,
  CheckCircle2,
  Activity
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

interface SearchKeyword {
  id: number;
  keyword: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [naraBids, setNaraBids] = useState<NaraBid[]>([]);
  const [boards, setBoards] = useState<any[]>([]);
  const [isLoadingBids, setIsLoadingBids] = useState(true);
  const [keywords, setKeywords] = useState<SearchKeyword[]>([]);
  const [isLoadingBoards, setIsLoadingBoards] = useState(true);
  const [schoolStats, setSchoolStats] = useState({ total: 0, active: 0, closed: 0, students: 0 });
  const [isLoadingStats, setIsLoadingStats] = useState(true);

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
      fetchKeywords();
      fetchSchoolStats();
    }
  }, [status, session, router]);

  const fetchNaraBids = async () => {
    try {
      const response = await fetch('/api/nara');
      const result = await response.json();
      if (result.success) {
        setNaraBids(result.data.slice(0, 5));
      }
    } catch (error) {
      console.error('Error fetching bids:', error);
    } finally {
      setIsLoadingBids(false);
    }
  };

  const fetchKeywords = async () => {
    try {
      const response = await fetch('/api/nara/keywords');
      if (response.ok) {
        const data = await response.json();
        setKeywords(data.slice(0, 5));
      }
    } catch (error) {
      console.error('Error fetching keywords:', error);
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

  const fetchSchoolStats = async () => {
    try {
      const response = await fetch('/api/schools');
      if (response.ok) {
        const data = await response.json();
        const stats = {
          total: data.length,
          active: data.filter((s: any) => s.status === 'active').length,
          closed: data.filter((s: any) => s.status === 'closed').length,
          students: data.reduce((acc: number, s: any) => acc + (s.studentCount || 0), 0)
        };
        setSchoolStats(stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoadingStats(false);
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
    <div className="flex-1 space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-1">
             <div className="p-2 bg-purple-100 rounded-lg">
                <LayoutDashboard className="w-5 h-5 text-purple-700" />
             </div>
             <p className="text-sm font-bold text-purple-700 uppercase tracking-widest">Global Dashboard</p>
          </div>
          <h2 className="text-3xl font-black tracking-tight text-gray-900">비즈니스 요약</h2>
          <p className="text-gray-500 font-medium">실시간 주요 지표와 운영 현황을 한눈에 확인하세요.</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" className="rounded-xl border-gray-200 h-11 px-6 font-bold hover:bg-white shadow-sm" onClick={() => { fetchNaraBids(); fetchBoards(); fetchSchoolStats(); }}>
              <Clock className="mr-2 w-4 h-4" /> 새로고침
           </Button>
           <Button className="bg-purple-800 text-white rounded-xl h-11 px-6 font-bold hover:bg-purple-900 shadow-xl shadow-purple-200" onClick={() => router.push('/notices/keywords')}>
              <Settings className="mr-2 w-4 h-4" /> 키워드 설정
           </Button>
        </div>
      </div>

      {/* 4분할 요약 섹션 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-none shadow-xl shadow-gray-200/50 bg-white overflow-hidden group hover:shadow-2xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl group-hover:scale-110 transition-transform">
                <School className="w-6 h-6" />
              </div>
              <Badge className="bg-blue-50 text-blue-600 border-none font-bold">TOTAL</Badge>
            </div>
            <p className="text-sm font-bold text-gray-500 mb-1">전체 교복 학교</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-black text-gray-900">{isLoadingStats ? '...' : schoolStats.total}</h3>
              <span className="text-sm font-bold text-gray-400">개교</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl shadow-gray-200/50 bg-white overflow-hidden group hover:shadow-2xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:scale-110 transition-transform">
                <Activity className="w-6 h-6" />
              </div>
              <Badge className="bg-emerald-50 text-emerald-600 border-none font-bold">ACTIVE</Badge>
            </div>
            <p className="text-sm font-bold text-gray-500 mb-1">진행 현황</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-black text-emerald-600">{isLoadingStats ? '...' : schoolStats.active}</h3>
              <span className="text-sm font-bold text-gray-400">건 진행</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl shadow-gray-200/50 bg-white overflow-hidden group hover:shadow-2xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl group-hover:scale-110 transition-transform">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <Badge className="bg-purple-50 text-purple-600 border-none font-bold">DONE</Badge>
            </div>
            <p className="text-sm font-bold text-gray-500 mb-1">완료 현황</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-black text-gray-900">{isLoadingStats ? '...' : schoolStats.closed}</h3>
              <span className="text-sm font-bold text-gray-400">건 완료</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl shadow-gray-200/50 bg-gradient-to-br from-purple-800 to-indigo-900 text-white overflow-hidden group hover:shadow-2xl transition-all duration-300">
          <CardContent className="p-6 relative">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <Users className="w-20 h-20" />
            </div>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 text-white rounded-2xl">
                <Users className="w-6 h-6" />
              </div>
              <Badge className="bg-white/20 text-white border-none font-bold">MANAGED</Badge>
            </div>
            <p className="text-sm font-bold text-white/60 mb-1">누적 관리 학생수</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-black">{isLoadingStats ? '...' : schoolStats.students.toLocaleString()}</h3>
              <span className="text-sm font-bold text-white/40">명</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-7 gap-8">
        {/* 파트너 공지사항 */}
        <Card className="lg:col-span-3 border-none shadow-xl shadow-gray-200/50 bg-white overflow-hidden h-full flex flex-col">
          <CardHeader className="bg-white border-b border-gray-50 pb-6 pt-7 px-8 flex flex-row items-center justify-between">
            <div className="space-y-1.5">
              <CardTitle className="text-xl font-black flex items-center gap-2">
                <Building2 className="w-5 h-5 text-purple-700" /> 온핏 파트너 공지사항
              </CardTitle>
              <CardDescription className="text-gray-400 font-medium tracking-tight">중요 공지사항과 시스템 정보를 확인하세요.</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="text-purple-600 font-bold hover:bg-purple-50 group px-2 rounded-xl" onClick={() => router.push('/notices')}>
              전체 보기 <ChevronRight className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </CardHeader>
          <CardContent className="p-0 flex-1">
            {isLoadingBoards ? (
              <div className="flex flex-col items-center justify-center p-20 text-gray-400">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-800 mb-4" />
                <p className="font-medium">불러오는 중...</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50 px-8 py-2">
                {boards.length > 0 ? boards.slice(0, 5).map((board) => (
                  <div 
                    key={board.id} 
                    className="group py-5 flex items-center justify-between cursor-pointer hover:translate-x-1 transition-all duration-200"
                    onClick={() => router.push(`/notices/${board.id}`)}
                  >
                    <div className="space-y-1.5 flex-1 pr-10">
                      <div className="flex items-center gap-2">
                         <Badge className="bg-purple-50 text-purple-600 border-none font-bold text-[10px] px-1.5 h-5">공지</Badge>
                         <p className="font-bold text-gray-800 leading-snug group-hover:text-purple-800 transition-colors line-clamp-1">
                          {board.title}
                         </p>
                      </div>
                      <p className="text-[11px] text-gray-400 font-medium leading-tight">관리자 | {new Date(board.createdAt).toLocaleDateString()}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-200 group-hover:text-purple-300 transition-colors" />
                  </div>
                )) : (
                  <div className="flex flex-col items-center justify-center p-20 text-gray-400">
                    <p className="font-medium">등록된 공지사항이 없습니다.</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
          <div className="p-6 bg-gray-50/50 border-t border-gray-50">
            <Button className="w-full bg-white text-purple-700 border-purple-100 hover:bg-purple-50 font-bold rounded-xl shadow-sm" variant="outline" onClick={() => router.push('/notices')}>
              공지사항 아카이브 더 보기
            </Button>
          </div>
        </Card>

        {/* 입찰 공고 목록 */}
        <div className="lg:col-span-4 space-y-6 flex flex-col h-full">
          <Card className="border-none shadow-xl shadow-gray-200/50 bg-white overflow-hidden h-full flex flex-col">
            <CardHeader className="bg-white border-b border-gray-50 pb-6 pt-7 px-8 flex flex-row items-center justify-between">
              <div className="space-y-1.5">
                <CardTitle className="text-xl font-black flex items-center gap-2">
                  <Gavel className="w-5 h-5 text-purple-700" /> 입찰 공고 리스트
                </CardTitle>
                <CardDescription className="text-gray-400 font-medium tracking-tight">설정된 키워드로 필터링된 나라장터 공고입니다.</CardDescription>
              </div>
              <Button variant="ghost" size="icon" className="h-10 w-10 text-gray-300 hover:text-purple-600 rounded-xl" onClick={() => window.open('https://www.g2b.go.kr', '_blank')}>
                <ArrowUpRight className="w-5 h-5" />
              </Button>
            </CardHeader>
            <CardContent className="p-0 flex-1">
               {isLoadingBids ? (
                 <div className="flex flex-col items-center justify-center p-20 text-gray-400">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-800 mb-4" />
                    <p className="font-medium">공고를 불러오는 중...</p>
                 </div>
               ) : (
                 <div className="divide-y divide-gray-50 px-8 py-2">
                   {naraBids.length > 0 ? naraBids.map((bid, i) => (
                     <div 
                        key={i} 
                        className="group py-4 flex items-center justify-between cursor-pointer transition-all duration-200"
                        onClick={() => window.open(bid.url, '_blank')}
                      >
                        <div className="space-y-1.5 flex-1 pr-10">
                          <div className="flex items-center gap-2">
                             <Badge className={`border-none font-bold text-[10px] px-1.5 h-5 ${
                               bid.status === '마감임박' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                             }`}>
                                {bid.status}
                             </Badge>
                             <p className="font-bold text-gray-800 leading-snug group-hover:text-purple-800 transition-colors line-clamp-1">
                              {bid.bidNtceNm}
                             </p>
                          </div>
                          <p className="text-[11px] text-gray-400 font-medium flex items-center gap-3">
                            <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {bid.ntceInstNm}</span>
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {bid.bidEndDate}</span>
                          </p>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-gray-200 group-hover:text-purple-300 transition-colors" />
                      </div>
                   )) : (
                      <div className="flex flex-col items-center justify-center p-20 text-gray-400 text-center">
                        <Gavel className="w-12 h-12 opacity-10 mb-2" />
                        <p className="font-medium">일치하는 입찰 공고가 없습니다.</p>
                      </div>
                   )}
                 </div>
               )}
            </CardContent>
            
            <div className="p-8 bg-gray-50/50 border-t border-gray-50">
               <div className="flex items-center justify-between mb-4 px-1">
                  <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Hash className="w-3 h-3 text-purple-400" /> 나의 검색 키워드
                  </p>
                  <Button variant="ghost" className="h-6 text-[10px] font-black text-purple-600 hover:bg-purple-100/50 p-0 px-2" onClick={() => router.push('/notices/keywords')}>수정하기</Button>
               </div>
               <div className="flex flex-wrap gap-2 mb-6">
                  {keywords.length > 0 ? keywords.map((k) => (
                    <Badge key={k.id} className="bg-white text-gray-700 border border-gray-100 font-bold text-[10px] px-3 py-1.5 rounded-xl hover:border-purple-200 hover:text-purple-800 transition-all cursor-default shadow-sm">
                      {k.keyword}
                    </Badge>
                  )) : (
                    <p className="text-[10px] text-gray-300 font-medium">등록된 키워드가 없습니다.</p>
                  )}
               </div>
               <div className="flex gap-3">
                 <Button className="flex-1 bg-purple-800 text-white rounded-xl h-11 font-bold hover:bg-purple-900 shadow-lg shadow-purple-100" onClick={() => window.open('https://www.g2b.go.kr', '_blank')}>
                    나라장터 바로가기
                 </Button>
                 <Button variant="outline" className="flex-1 border-gray-200 rounded-xl h-11 font-bold hover:bg-white" onClick={() => router.push('/notices/keywords')}>
                    키워드 통합 관리
                 </Button>
               </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}