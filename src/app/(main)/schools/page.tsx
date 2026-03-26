'use client';

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { DataTable } from "@/components/ui/data-table";
import { columns, Student } from "./columns";
import { PlusCircle, School as SchoolIcon, ChevronRight, LayoutGrid, ListFilter, Users, CheckCircle, Info, SendIcon } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface School {
  id: number;
  seq: string;
  yearMonth: string;
  schoolName: string;
  userId: number;
  useYn: string;
  status: 'active' | 'closed';
  createdAt: string;
  studentCount: number;
  measuredCount: number;
}

/** yearMonth(YYYYMM) → 'YYYY년 MM월' */
function formatYearMonth(ym: string): string {
  if (!ym || ym.length !== 6) return ym;
  return `${ym.slice(0, 4)}년 ${ym.slice(4)}월`;
}

export default function SchoolsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [schools, setSchools] = useState<School[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStudentsLoading, setIsStudentsLoading] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (status === 'authenticated') {
      fetchSchools();
    }
  }, [status, router]);

  useEffect(() => {
    const newId = searchParams.get('newId');
    if (newId && schools.length > 0) {
      const idNum = Number(newId);
      if (selectedSchoolId !== idNum) setSelectedSchoolId(idNum);
      router.replace('/schools', { scroll: false });
    } else if (schools.length > 0 && selectedSchoolId === null) {
      setSelectedSchoolId(schools[0].id);
    }
  }, [schools, selectedSchoolId, searchParams, router]);

  useEffect(() => {
    if (selectedSchoolId) fetchStudents(selectedSchoolId);
  }, [selectedSchoolId]);

  const fetchSchools = async () => {
    try {
      const response = await fetch('/api/schools', { credentials: 'include' });
      if (!response.ok) {
        if (response.status === 401) { router.push('/login'); return; }
        throw new Error('데이터를 불러오는데 실패했습니다.');
      }
      const data = await response.json();
      setSchools(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching schools:', error);
      toast.error('학교 목록을 불러오는데 실패했습니다.');
      setSchools([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStudents = async (schoolId: number) => {
    setIsStudentsLoading(true);
    try {
      const response = await fetch(`/api/students?schoolId=${schoolId}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || '학생 목록 조회에 실패했습니다.');
      setStudents(data.data || []);
    } catch (error: any) {
      toast.error(error.message);
      setStudents([]);
    } finally {
      setIsStudentsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#4B0082' }} />
      </div>
    );
  }

  const selectedSchool = schools.find(s => s.id === selectedSchoolId);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Breadcrumbs */}
      <nav className="flex text-sm text-gray-500" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-1">
          <li>학교 관리</li>
          <li className="flex items-center">
            <ChevronRight className="w-3 h-3 mx-1" />
            <span className="text-gray-900 font-semibold">목록</span>
          </li>
        </ol>
      </nav>

      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">학교 관리</h1>
          <p className="text-gray-500 mt-1">등록된 학교와 학생 명단을 한눈에 관리하세요.</p>
        </div>
        <Button
          onClick={() => router.push('/schools/register')}
          variant="default"
          className="text-white shadow-lg h-11 px-6 hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #4B0082, #6A0DAD)' }}
        >
          <PlusCircle className="mr-2 w-4 h-4" /> 학교 신규 등록
        </Button>
      </div>

      {schools.length > 0 ? (
        /* 2단 그리드: 학교 목록(1/3) + 학생 목록(2/3) */
        <div className="grid grid-cols-3 gap-6 items-start">
          {/* 왼쪽: 학교 목록 */}
          <div className="col-span-1 space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-sm font-bold flex items-center text-gray-700">
                <ListFilter className="w-4 h-4 mr-2" /> 학교 목록
              </h2>
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">총 {schools.length}개</span>
            </div>
            
            <div className="space-y-3 overflow-auto max-h-[700px] pr-1">
              {schools.map((school) => {
                const progress = school.studentCount > 0 ? (school.measuredCount / school.studentCount) * 100 : 0;
                const isSelected = selectedSchoolId === school.id;
                
                return (
                  <div
                    key={school.id}
                    onClick={() => setSelectedSchoolId(school.id)}
                    className={`group cursor-pointer p-4 rounded-xl border transition-all duration-200 ${
                      isSelected 
                        ? 'bg-white border-purple-500 shadow-md ring-1 ring-purple-500' 
                        : 'bg-white border-gray-100 hover:border-purple-200 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="space-y-0.5">
                        <p className="text-[10px] text-gray-400 font-medium">{formatYearMonth(school.yearMonth)}</p>
                        <h3 className={`font-bold text-sm ${isSelected ? 'text-purple-900' : 'text-gray-800'}`}>
                          {school.schoolName}
                        </h3>
                      </div>
                      <Badge 
                        variant={school.status === 'active' ? 'default' : 'secondary'}
                        className={`text-[10px] px-1.5 py-0 rounded-md font-bold ${
                          school.status === 'active' 
                            ? 'bg-purple-100 text-purple-700 hover:bg-purple-100' 
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {school.status === 'active' ? '진행 중' : '마감'}
                      </Badge>
                    </div>
                    
                    <div className="mt-4 space-y-1.5">
                      <div className="flex justify-between text-[10px] text-gray-500 font-medium">
                        <span>치수 측정 진행률</span>
                        <span>{Math.round(progress)}% ({school.measuredCount}/{school.studentCount})</span>
                      </div>
                      <Progress 
                        value={progress} 
                        className="h-1.5 bg-gray-100" 
                        style={{'--progress-foreground': '#4B0082'} as any}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 오른쪽: 학생 목록 및 대시보드 */}
          <div className="col-span-2 space-y-6">
            {selectedSchool ? (
              <>
                {/* 통계 요약 대시보드 */}
                <div className="grid grid-cols-4 gap-4 animate-in">
                  {[
                    { label: '전체 학생', value: selectedSchool.studentCount, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50/50' },
                    { label: '측정 완료', value: selectedSchool.measuredCount, icon: CheckCircle, color: 'text-purple-600', bg: 'bg-purple-50/50' },
                    { label: '미측정', value: selectedSchool.studentCount - selectedSchool.measuredCount, icon: Info, color: 'text-amber-600', bg: 'bg-amber-50/50' },
                    { label: '진행률', value: `${Math.round(selectedSchool.studentCount > 0 ? (selectedSchool.measuredCount / selectedSchool.studentCount) * 100 : 0)}%`, icon: LayoutGrid, color: 'text-emerald-600', bg: 'bg-emerald-50/50' },
                  ].map((stat, i) => (
                    <div key={i} className={`${stat.bg} p-5 rounded-2xl border border-white shadow-sm hover:shadow-md transition-all duration-300`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">{stat.label}</p>
                          <p className={`text-2xl font-black mt-1 ${stat.color}`}>{stat.value}</p>
                        </div>
                        <div className={`p-2 rounded-lg ${stat.bg.replace('/50', '')} ${stat.color} bg-opacity-10`}>
                          <stat.icon className="w-5 h-5" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-in" style={{ animationDelay: '0.1s' }}>
                  <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-black text-gray-900 flex items-center">
                        {selectedSchool.schoolName}
                        <Badge className={`ml-3 border-none font-bold ${
                          selectedSchool.status === 'active' 
                            ? 'bg-purple-100 text-purple-700 hover:bg-purple-100' 
                            : 'bg-gray-100 text-gray-500'
                        }`}>
                          {selectedSchool.status === 'active' ? '측정 진행 중' : '기간 마감'}
                        </Badge>
                      </h2>
                      <p className="text-sm text-gray-400 mt-1 font-medium">학생들의 치수 측정 현황을 관리하고 QR 코드를 공유하세요.</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="h-10 text-xs font-bold border-gray-200 hover:bg-gray-50">
                        <SendIcon className="w-3.5 h-3.5 mr-2 text-purple-600" /> QR/문자 발송
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className={`h-10 text-xs font-bold border-gray-200 transition-colors ${
                          selectedSchool.status === 'closed' 
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100' 
                            : 'hover:bg-red-50 hover:text-red-600 hover:border-red-100'
                        }`}
                        onClick={async () => {
                          const newStatus = selectedSchool.status === 'active' ? 'closed' : 'active';
                          try {
                            const res = await fetch(`/api/schools/${selectedSchool.id}/status`, {
                              method: 'PATCH',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ status: newStatus })
                            });
                            if (res.ok) fetchSchools();
                          } catch (err) {
                            console.error(err);
                          }
                        }}
                      >
                        {selectedSchool.status === 'active' ? '측정 마감하기' : '측정 재개하기'}
                      </Button>
                    </div>
                  </div>

                  <div className="p-6">
                    <Tabs defaultValue="all" className="w-full mb-6">
                      <TabsList className="bg-gray-100/50 p-1 rounded-xl">
                        <TabsTrigger value="all" className="text-xs font-bold px-8 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">전체 학생</TabsTrigger>
                        <TabsTrigger value="pending" className="text-xs font-bold px-8 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">미측정 인원</TabsTrigger>
                        <TabsTrigger value="completed" className="text-xs font-bold px-8 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">측정 완료</TabsTrigger>
                      </TabsList>
                    </Tabs>

                    <div className="rounded-xl border border-gray-100 overflow-hidden">
                      {isStudentsLoading ? (
                        <div className="h-[400px] flex flex-col items-center justify-center space-y-4 text-gray-400">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#4B0082' }} />
                          <p className="text-sm">학생 정보를 불러오는 중...</p>
                        </div>
                      ) : (
                        <DataTable
                          columns={columns}
                          data={students}
                          placeholder="등록된 학생이 없습니다."
                        />
                      )}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="h-[600px] flex flex-col items-center justify-center bg-white rounded-2xl border border-dashed border-gray-200 text-gray-400">
                <SchoolIcon className="w-16 h-16 mb-4 opacity-10" />
                <p className="font-bold">학교를 선택하면 학생 명단이 표시됩니다.</p>
                <p className="text-xs mt-1">왼쪽 목록에서 학교를 클릭해 주세요.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="py-20 bg-white rounded-2xl border-2 border-dashed flex flex-col items-center justify-center space-y-6 text-center">
          <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center">
            <SchoolIcon className="w-10 h-10" style={{ color: '#4B0082' }} />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold">등록된 학교가 없습니다</h3>
            <p className="text-gray-500 max-w-sm text-sm">
              교복 관리를 시작하기 위해 먼저 학교 정보를 등록해 주세요.<br />
              엑셀 업로드를 통해 학생 명단을 일괄 등록할 수 있습니다.
            </p>
          </div>
          <Button
            onClick={() => router.push('/schools/register')}
            className="text-white h-12 px-8 hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #4B0082, #6A0DAD)' }}
          >
            <PlusCircle className="mr-2 w-5 h-5" /> 첫 학교 등록하기
          </Button>
        </div>
      )}
    </div>
  );
}
