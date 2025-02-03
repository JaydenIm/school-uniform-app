'use client';

import { useEffect, useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { TabulatorFull } from 'tabulator-tables';
import type { TabulatorFull as Tabulator } from 'tabulator-tables';
import "tabulator-tables/dist/css/tabulator.min.css";
import { format } from 'date-fns';
import { useSession } from 'next-auth/react';

interface School {
  id: number;
  seq: string;
  yearMonth: string;
  schoolName: string;
  userId: number;
  useYn: string;
  createdAt: string;
}

interface Student {
  id: number;
  name: string;
  birthDate: string;
  phoneNumber: string;
}

type Tabulator = InstanceType<typeof TabulatorFull>;

export default function SchoolsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const tableRef = useRef<HTMLDivElement>(null);
  const tabulator = useRef<Tabulator | null>(null);

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
    if (schools.length > 0 && !selectedSchoolId) {
      setSelectedSchoolId(schools[0].id);
    }
  }, [schools, selectedSchoolId]);

  useEffect(() => {
    if (selectedSchoolId && tableRef.current) {
      initTabulator();
      fetchStudents(selectedSchoolId);
    }
  }, [selectedSchoolId]);

  const initTabulator = () => {
    if (tableRef.current) {
      tabulator.current = new TabulatorFull(tableRef.current, {
        height: '600px',
        layout: 'fitColumns',
        columns: [
          { title: '이름', field: 'name', width: 120, headerHozAlign: 'center', hozAlign: 'center' },
          { title: '생년월일', field: 'birthDate', width: 120, headerHozAlign: 'center', hozAlign: 'center' },
          { title: '연락처', field: 'phoneNumber', width: 150, headerHozAlign: 'center', hozAlign: 'center' },
        ],
        placeholder: '등록된 학생이 없습니다.',
        pagination: false,
        movableColumns: false,
        cssClass: 'custom-tabulator',
      });
    }
  };

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
    try {
      const response = await fetch(`/api/students?schoolId=${schoolId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || '학생 목록 조회에 실패했습니다.');
      }

      if (tabulator.current) {
        tabulator.current.setData(data.data);
      }
    } catch (error: any) {
      toast.error(error.message);
      if (tabulator.current) {
        tabulator.current.setData([]);
      }
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
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">학교 관리</h1>
        <Button 
          onClick={() => router.push('/settings/schools/register')}
          variant="default"
          className="bg-black hover:bg-gray-900 text-white"
        >
          학교 등록
        </Button>
      </div>
      
      <div className="grid grid-cols-2 gap-6">
        {/* 왼쪽: 학교 목록 */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4">학교 목록</h2>
            <div className="overflow-auto max-h-[600px]">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">순번</th>
                    <th className="text-left py-3 px-4">연월</th>
                    <th className="text-left py-3 px-4">학교명</th>
                    <th className="text-left py-3 px-4">등록일</th>
                  </tr>
                </thead>
                <tbody>
                  {schools.map((school) => (
                    <tr 
                      key={school.id} 
                      className={`border-b cursor-pointer hover:bg-gray-50 ${
                        selectedSchoolId === school.id ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => setSelectedSchoolId(school.id)}
                    >
                      <td className="py-3 px-4">{school.seq}</td>
                      <td className="py-3 px-4">{school.yearMonth}</td>
                      <td className="py-3 px-4">{school.schoolName}</td>
                      <td className="py-3 px-4">
                        {format(new Date(school.createdAt), 'yyyy-MM-dd')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 오른쪽: 학생 목록 (Tabulator) */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-4">
            {selectedSchoolId 
              ? `${schools.find(s => s.id === selectedSchoolId)?.schoolName} 학생 목록`
              : '학교를 선택하세요'
            }
          </h2>
          <div ref={tableRef} className="w-full"></div>
        </div>
      </div>
    </div>
  );
} 