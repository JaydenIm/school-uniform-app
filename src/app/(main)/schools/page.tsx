'use client';

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { DataTable } from "@/components/ui/data-table";
import { columns, Student } from "./columns";
import { PlusCircle, School as SchoolIcon, ChevronRight, LayoutGrid, ListFilter } from 'lucide-react';

interface School {
  id: number;
  seq: string;
  yearMonth: string;
  schoolName: string;
  userId: number;
  useYn: string;
  createdAt: string;
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
          <div className="col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 bg-gray-50/70 border-b flex items-center justify-between">
              <h2 className="text-sm font-bold flex items-center text-gray-700">
                <ListFilter className="w-4 h-4 mr-2" /> 학교 목록
              </h2>
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">총 {schools.length}개</span>
            </div>
            <div className="overflow-auto max-h-[600px]">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-white sticky top-0 shadow-[0_1px_0_0_#f3f4f6]">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">연월</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">학교명</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {schools.map((school) => (
                    <tr
                      key={school.id}
                      className={`cursor-pointer transition-colors duration-150 ${
                        selectedSchoolId === school.id ? 'text-white' : 'hover:bg-purple-50'
                      }`}
                      style={selectedSchoolId === school.id ? { background: '#4B0082' } : {}}
                      onClick={() => setSelectedSchoolId(school.id)}
                    >
                      <td className="px-4 py-3 whitespace-nowrap text-xs opacity-80">{formatYearMonth(school.yearMonth)}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold">{school.schoolName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 오른쪽: 학생 목록 */}
          <div className="col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-4">
              <h2 className="text-lg font-bold flex items-center">
                <LayoutGrid className="w-5 h-5 mr-2 text-gray-400" />
                {selectedSchool ? `${selectedSchool.schoolName} 학생 목록` : '학교를 선택하세요'}
              </h2>
              {selectedSchool && (
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-full font-medium border border-purple-100">
                    {formatYearMonth(selectedSchool.yearMonth)}
                  </span>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-600">
                    {students.length}명 등록됨
                  </span>
                </div>
              )}
            </div>

            {selectedSchoolId ? (
              isStudentsLoading ? (
                <div className="h-[460px] flex flex-col items-center justify-center space-y-4 text-gray-400">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#4B0082' }} />
                  <p className="text-sm">학생 정보를 불러오는 중...</p>
                </div>
              ) : (
                <div className="animate-in fade-in duration-300">
                  <DataTable
                    columns={columns}
                    data={students}
                    placeholder="등록된 학생이 없습니다."
                  />
                </div>
              )
            ) : (
              <div className="h-[460px] flex flex-col items-center justify-center text-gray-400 space-y-3 bg-gray-50/50 rounded-lg border-2 border-dashed">
                <SchoolIcon className="w-12 h-12 text-gray-200" />
                <p className="text-sm">좌측 목록에서 학교를 선택해 주세요.</p>
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
