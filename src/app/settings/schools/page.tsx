'use client';

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface School {
  id: number;
  seq: string;
  schoolName: string;
  yearMonth: string;
  createdAt: string;
}

export default function SchoolsPage() {
  const router = useRouter();
  const [schools, setSchools] = useState<School[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSchools();
  }, []);

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

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">학교 관리</h1>
        <Button 
          onClick={() => router.push('/settings/schools/register')}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          학교 등록
        </Button>
      </div>
      
      <div className="bg-white rounded-lg shadow">
        <div className="p-4">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">학교명</th>
                <th className="text-left py-3 px-4">등록년월</th>
                <th className="text-left py-3 px-4">등록일</th>
                <th className="text-left py-3 px-4">관리</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="text-center py-4">로딩 중...</td>
                </tr>
              ) : schools.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-4 text-gray-500">
                    등록된 학교가 없습니다.
                  </td>
                </tr>
              ) : (
                schools.map((school) => (
                  <tr key={school.id} className="border-b">
                    <td className="py-3 px-4">{school.schoolName}</td>
                    <td className="py-3 px-4">{school.yearMonth}</td>
                    <td className="py-3 px-4">
                      {new Date(school.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/settings/schools/${school.id}`)}
                      >
                        상세
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 