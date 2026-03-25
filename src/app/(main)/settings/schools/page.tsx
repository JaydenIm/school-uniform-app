'use client';

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { format } from 'date-fns';
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
      if (selectedSchoolId !== idNum) {
        setSelectedSchoolId(idNum);
      }
      // URL에서 newId 제거 (Next.js router 사용 권장)
      router.replace('/settings/schools', { scroll: false });
    } else if (schools.length > 0 && selectedSchoolId === null) {
      setSelectedSchoolId(schools[0].id);
    }
  }, [schools, selectedSchoolId, searchParams, router]);

  useEffect(() => {
    if (selectedSchoolId) {
      fetchStudents(selectedSchoolId);
    }
  }, [selectedSchoolId]);

  const fetchSchools = async () => {
    try {
      const response = await fetch('/api/schools', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login');
          return;
        }
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

      if (!response.ok) {
        throw new Error(data.message || '학생 목록 조회에 실패했습니다.');
      }

      setStudents(data.data || []);
    } catch (error: any) {
      toast.error(error.message);
      setStudents([]);
    } finally {
      setIsStudentsLoading(false);
    }
  };

  const handleAddSchool = async () => {
    try {
      // 현재 날짜로 seq와 yearMonth 생성
      const now = new Date();
      const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
      const seq = `${yearMonth}00001`;  // 실제로는 DB에서 마지막 seq를 조회하여 +1 해야 함

      const response = await fetch('/api/schools', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          seq,
          yearMonth,
          schoolName: '테스트학교',
        }),
        credentials: 'include'
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || '학교 등록에 실패했습니다.');
      }

      toast.success('학교가 등록되었습니다.');
      fetchSchools();
    } catch (error: any) {
      console.error('Error adding school:', error);
      toast.error(error.message || '학교 등록에 실패했습니다.');
    }
  };

  if (isLoading) {
    return <div>로딩 중...</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Breadcrumbs */}
      <nav className="flex text-sm text-gray-500" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2">
          <li>계정 설정</li>
          <li className="flex items-center space-x-2">
            <ChevronRight className="w-3 h-3 mx-1" />
            <span className="text-black font-semibold">학교 관리</span>
          </li>
        </ol>
      </nav>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">학교 관리</h1>
          <p className="text-gray-500 mt-1">등록된 학교와 학생 명단을 한눈에 관리하세요.</p>
        </div>
        <Button 
          onClick={() => router.push('/settings/schools/register')}
          variant="default"
          className="bg-black hover:bg-gray-800 text-white shadow-lg h-11 px-6"
        >
          <PlusCircle className="mr-2 w-4 h-4" /> 학교 신규 등록
        </Button>
      </div>
      
        {schools.length > 0 ? (
          <>
            {/* 왼쪽: 학교 목록 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-0">
                <div className="p-4 bg-gray-50/50 border-b flex items-center justify-between">
                  <h2 className="text-sm font-bold flex items-center">
                    <ListFilter className="w-4 h-4 mr-2" /> 학교 목록
                  </h2>
                  <span className="text-xs text-gray-400">총 {schools.length}개</span>
                </div>
                <div className="overflow-auto max-h-[600px]">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-white sticky top-0">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">순번</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">연월</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">학교명</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {schools.map((school) => (
                        <tr 
                          key={school.id} 
                          className={`cursor-pointer transition-colors duration-200 ${
                            selectedSchoolId === school.id ? 'bg-black text-white' : 'hover:bg-gray-50'
                          }`}
                          onClick={() => setSelectedSchoolId(school.id)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm">{school.seq}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">{school.yearMonth}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{school.schoolName}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* 오른쪽: 학생 목록 (DataTable) */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden p-6 space-y-4">
              <div className="flex items-center justify-between border-b pb-4 mb-2">
                <h2 className="text-lg font-bold flex items-center">
                  <LayoutGrid className="w-5 h-5 mr-2 text-gray-400" />
                  {selectedSchoolId 
                    ? `${schools.find(s => s.id === selectedSchoolId)?.schoolName} 학생 목록`
                    : '학교를 선택하세요'
                  }
                </h2>
                {selectedSchoolId && (
                   <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-600">
                      {students.length}명 등록됨
                   </span>
                )}
              </div>
              {selectedSchoolId ? (
                isStudentsLoading ? (
                  <div className="h-[500px] flex flex-col items-center justify-center space-y-4 text-gray-400">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                    <p>학생 정보를 불러오는 중...</p>
                  </div>
                ) : (
                  <div className="animate-in fade-in duration-500">
                    <DataTable 
                      columns={columns} 
                      data={students} 
                      placeholder="등록된 학생이 없습니다."
                    />
                  </div>
                )
              ) : (
                <div className="h-[500px] flex flex-col items-center justify-center text-gray-400 space-y-4 bg-gray-50/50 rounded-lg border-2 border-dashed">
                  <SchoolIcon className="w-12 h-12 text-gray-200" />
                  <p>좌측 목록에서 학교를 선택해 주세요.</p>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="col-span-2 py-20 bg-white rounded-2xl border-2 border-dashed flex flex-col items-center justify-center space-y-6 text-center animate-in zoom-in-95 duration-500">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center">
              <SchoolIcon className="w-10 h-10 text-gray-300" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold">등록된 학교가 없습니다</h3>
              <p className="text-gray-500 max-w-sm">
                교복 관리를 시작하기 위해 먼저 학교 정보를 등록해 주세요. 엑셀 업로드를 통해 학생 명단을 일괄 등록할 수 있습니다.
              </p>
            </div>
            <Button 
              onClick={() => router.push('/settings/schools/register')}
              className="bg-black hover:bg-gray-800 text-white h-12 px-8"
            >
              <PlusCircle className="mr-2 w-5 h-5" /> 첫 학교 등록하기
            </Button>
          </div>
        )}
    </div>
  );
}