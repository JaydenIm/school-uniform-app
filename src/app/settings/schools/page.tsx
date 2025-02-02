'use client';

import { useEffect, useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { TabulatorFull } from 'tabulator-tables';
import type { TabulatorFull as Tabulator } from 'tabulator-tables';
import "tabulator-tables/dist/css/tabulator.min.css";

interface School {
  id: number;
  seq: string;
  schoolName: string;
  yearMonth: string;
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
  const router = useRouter();
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const tableRef = useRef<HTMLDivElement>(null);
  const tabulator = useRef<Tabulator | null>(null);

  useEffect(() => {
    fetchSchools();
  }, []);

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
      const response = await fetch('/api/schools');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || '학교 목록 조회에 실패했습니다.');
      }

      setSchools(data.data);
    } catch (error: any) {
      toast.error(error.message);
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
                    <th className="text-left py-3 px-4">학교명</th>
                    <th className="text-left py-3 px-4">등록년월</th>
                    <th className="text-left py-3 px-4">등록일</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={3} className="text-center py-4">로딩 중...</td>
                    </tr>
                  ) : schools.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="text-center py-4 text-gray-500">
                        등록된 학교가 없습니다.
                      </td>
                    </tr>
                  ) : (
                    schools.map((school) => (
                      <tr 
                        key={school.id} 
                        className={`border-b cursor-pointer hover:bg-gray-50 ${
                          selectedSchoolId === school.id ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => setSelectedSchoolId(school.id)}
                      >
                        <td className="py-3 px-4">{school.schoolName}</td>
                        <td className="py-3 px-4">{school.yearMonth}</td>
                        <td className="py-3 px-4">
                          {new Date(school.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
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