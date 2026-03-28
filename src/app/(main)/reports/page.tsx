'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FileSpreadsheet, Download, School, FileText, CheckCircle, Clock } from 'lucide-react';

interface SchoolData {
  id: number;
  schoolName: string;
  yearMonth: string;
  studentCount: number;
  measuredCount: number;
}

export default function MeasurementReportsPage() {
  const { status } = useSession();
  const router = useRouter();

  const [schools, setSchools] = useState<SchoolData[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<SchoolData | null>(null);
  const [students, setStudents] = useState<any[]>([]);
  
  const [isLoadingSchools, setIsLoadingSchools] = useState(true);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (status === 'authenticated') {
      fetchSchools();
    }
  }, [status, router]);

  const fetchSchools = async () => {
    try {
      const response = await fetch('/api/schools');
      if (response.ok) {
        const data = await response.json();
        setSchools(data || []);
      }
    } catch (error) {
      toast.error('학교 목록을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoadingSchools(false);
    }
  };

  const fetchMeasurements = async (school: SchoolData) => {
    setSelectedSchool(school);
    setIsLoadingStudents(true);
    try {
      const response = await fetch(`/api/reports/measurements?schoolId=${school.id}`);
      const result = await response.json();
      if (result.success) {
        setStudents(result.data || []);
      } else {
        toast.error(result.error || '측정 데이터를 불러올 수 없습니다.');
      }
    } catch {
      toast.error('오류가 발생했습니다.');
    } finally {
      setIsLoadingStudents(false);
    }
  };

  const downloadExcel = async () => {
    if (!students || students.length === 0) {
      toast.warning('다운로드할 데이터가 없습니다.');
      return;
    }

    try {
      // @ts-ignore
      const XLSX = await import('xlsx-js-style');

      // 헤더 정의
    const headers = [
      "이름", "성별", "학년", "반", "상태", "전화번호", 
      "상의-어깨", "상의-가슴", "상의-기장", "상의-소매", 
      "하의-허리", "하의-엉덩이", "하의-허벅지", "하의-기장",
      "추가-후드티", "추가-반팔티", "추가-폴로티", "추가-스웨터",
      "비고(메모)"
    ];

    // 데이터 가공
    const excelData = students.map(st => {
      const m = st.measurement || {};
      const statusKr = m.status === 'completed' ? '입력 완료' : (m.status === 'measured' ? '측정 완료' : '미측정');
      
      return [
        st.name || "",
        st.gender === 'male' ? '남' : (st.gender === 'female' ? '여' : ''),
        st.grade || "",
        st.class || "",
        statusKr,
        st.phoneNumber || "",
        m.shoulder ?? "", m.chest ?? "", m.upperLength ?? "", m.sleeveLength ?? "",
        m.waist ?? "", m.hip ?? "", m.thigh ?? "", m.pantsLength ?? "",
        m.qtyHoodie ?? 0, m.qtyTshirt ?? 0, m.qtyPolo ?? 0, m.qtySweater ?? 0,
        m.note || ""
      ];
    });

    // 헤더 삽입
    excelData.unshift(headers);

    // 워크시트 생성
    const sheet = XLSX.utils.aoa_to_sheet(excelData);

    // 스타일 적용 (첫 행 헤더 스타일)
    const headerStyle = {
      fill: { fgColor: { rgb: "E9D8FD" } }, // 보라색 배경
      font: { bold: true, color: { rgb: "4B0082" } },
      alignment: { horizontal: "center", vertical: "center" },
      border: {
        top: { style: "thin", color: { auto: 1 } },
        bottom: { style: "thin", color: { auto: 1 } },
        left: { style: "thin", color: { auto: 1 } },
        right: { style: "thin", color: { auto: 1 } },
      }
    };

    const dataStyle = {
      alignment: { horizontal: "center" },
      border: {
        top: { style: "thin", color: { auto: 1 } },
        bottom: { style: "thin", color: { auto: 1 } },
        left: { style: "thin", color: { auto: 1 } },
        right: { style: "thin", color: { auto: 1 } },
      }
    };

    // 셀 순회하며 스타일 입히기
    const range = XLSX.utils.decode_range(sheet['!ref']!);
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cell_address = { c: C, r: R };
        const cell_ref = XLSX.utils.encode_cell(cell_address);
        if (!sheet[cell_ref]) continue;

        if (R === 0) {
          sheet[cell_ref].s = headerStyle;
        } else {
          sheet[cell_ref].s = dataStyle;
        }
      }
    }

    // 각 열의 너비 지정
    const wscols = [
      { wch: 10 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 12 }, { wch: 16 }, // 기본 정보
      { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, // 상의
      { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, // 하의
      { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, // 추가품목
      { wch: 30 } // 비고
    ];
    sheet['!cols'] = wscols;

    // 워크북 통합 및 다운로드
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, sheet, "측정 데이터");
    
    // 파일명 지정: [학교명]_[년도학기]_측정데이터.xlsx
    const fileName = `[${selectedSchool?.schoolName}]_${selectedSchool?.yearMonth}_측정데이터.xlsx`;
    XLSX.writeFile(wb, fileName);
    toast.success('엑셀 다운로드가 완료되었습니다.');
    } catch (e) {
      console.error(e);
      toast.error('엑셀 생성 중 오류가 발생했습니다.');
    }
  };

  const onCopySms = (student: any) => {
    if (!student.token) {
      toast.error('학생 고유 토큰이 없습니다.');
      return;
    }
    
    const measureUrl = `${window.location.origin}/measure/${student.token}`;
    const message = `[온핏 시스템 안내]\n\n` +
      `안녕하세요, ${selectedSchool?.schoolName} 학생 여러분.\n\n` +
      `교복 치수 측정을 위한 나만의 측정 링크입니다:\n` +
      `${measureUrl}`;
    
    navigator.clipboard.writeText(message);
    toast.success(`${student.name} 학생의 안내 문구를 복사했습니다.`);
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900 flex items-center gap-3">
             <FileSpreadsheet className="w-8 h-8 text-purple-700" />
             측정 데이터 리포트
          </h1>
          <p className="text-gray-500 mt-2 font-medium">학교별 학생 치수 현황을 확인하고 엑셀(Excel)로 다운로드합니다.</p>
        </div>
        {selectedSchool && (
          <Button 
            onClick={downloadExcel}
            className="bg-[#217346] hover:bg-[#1e6b3f] text-white shadow-xl shadow-green-200/50 rounded-xl h-12 px-6 font-bold flex items-center gap-2 transform transition-transform hover:-translate-y-0.5"
          >
            <Download className="w-5 h-5" /> Excel 다운로드
          </Button>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        
        {/* 아코디언 스타일 대신 직관적인 세로형 카드 리스트: 왼쪽 학교 목록 영역 (1/4 크기) */}
        <div className="w-full lg:w-1/4 xl:w-[320px] shrink-0 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-purple-700 ml-1">학교 목록</h3>
          {isLoadingSchools ? (
            <div className="h-[400px] rounded-2xl bg-white border border-gray-100 flex items-center justify-center">
              <div className="animate-spin w-8 h-8 border-b-2 border-purple-800 rounded-full" />
            </div>
          ) : schools.length > 0 ? (
            <div className="space-y-3 max-h-[calc(100vh-250px)] overflow-y-auto custom-scrollbar pr-2">
              {schools.map(school => (
                <div 
                  key={school.id}
                  onClick={() => fetchMeasurements(school)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-sm
                    ${selectedSchool?.id === school.id 
                      ? 'bg-purple-800 border-purple-800 text-white translate-x-2' 
                      : 'bg-white border-gray-200 hover:border-purple-300 hover:bg-purple-50 hover:shadow-md'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <School className={`w-5 h-5 ${selectedSchool?.id === school.id ? 'text-purple-300' : 'text-purple-600'}`} />
                    <div>
                      <h4 className="font-bold text-lg leading-tight">{school.schoolName}</h4>
                      <p className={`text-xs mt-1 font-medium ${selectedSchool?.id === school.id ? 'text-purple-200' : 'text-gray-500'}`}>
                        {school.yearMonth} 학기
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
             <div className="py-12 bg-white rounded-2xl border-2 border-dashed flex items-center justify-center">
               <span className="text-gray-400 font-medium">등록된 학교가 없습니다.</span>
             </div>
          )}
        </div>

        {/* 상세 화면 영역 (3/4 크기) */}
        <div className="w-full lg:flex-1 h-full min-h-[500px]">
           <h3 className="text-sm font-bold uppercase tracking-widest text-purple-700 ml-1 mb-4 opacity-0 lg:opacity-100 hidden lg:block">상세 현황 및 데이터</h3>
           
           {!selectedSchool ? (
             <Card className="border-none shadow-xl bg-gray-50/50 flex flex-col items-center justify-center min-h-[500px] rounded-[2rem]">
               <FileText className="w-16 h-16 text-gray-300 mb-4" />
               <h3 className="text-xl font-bold text-gray-500">학교를 선택해주세요</h3>
               <p className="text-gray-400 mt-2 font-medium">왼쪽 목록에서 학교를 선택하면 상세 데이터를 볼 수 있습니다.</p>
             </Card>
           ) : (
             <Card className="border-none shadow-xl rounded-[2rem] bg-white overflow-hidden">
                {isLoadingStudents ? (
                  <div className="flex items-center justify-center h-[500px]">
                    <div className="flex flex-col items-center gap-4">
                      <div className="animate-spin w-10 h-10 border-b-2 border-purple-800 rounded-full" />
                      <p className="text-gray-500 font-medium">학생 데이터를 불러오는 중...</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <CardHeader className="border-b border-gray-100 bg-gray-50/50 py-6 px-8">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-2xl font-black text-gray-900">{selectedSchool.schoolName}</CardTitle>
                          <p className="text-gray-500 font-medium mt-1">{selectedSchool.yearMonth} 학생 현황 ({students.length}명)</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0 overflow-x-auto w-full max-h-[calc(100vh-300px)] custom-scrollbar">
                      {students.length === 0 ? (
                        <div className="py-20 text-center text-gray-400 font-medium">
                          등록된 학생 데이터가 없습니다.
                        </div>
                      ) : (
                        <table className="w-full text-sm text-left whitespace-nowrap">
                          <thead className="text-xs text-purple-950 uppercase bg-purple-50/80 sticky top-0 z-10 shadow-sm border-b border-purple-100">
                            <tr>
                              <th scope="col" className="px-6 py-4 font-black">이름</th>
                              <th scope="col" className="px-4 py-4 font-black">학년/반</th>
                              <th scope="col" className="px-4 py-4 font-black text-center">상태</th>
                              <th scope="col" className="px-4 py-4 font-bold tracking-tight text-center border-l border-white text-blue-900 bg-blue-50/50">상의:어깨</th>
                              <th scope="col" className="px-4 py-4 font-bold tracking-tight text-center text-blue-900 bg-blue-50/50">가슴</th>
                              <th scope="col" className="px-4 py-4 font-bold tracking-tight text-center text-blue-900 bg-blue-50/50">기장</th>
                              <th scope="col" className="px-4 py-4 font-bold tracking-tight text-center text-blue-900 bg-blue-50/50">소매</th>
                              <th scope="col" className="px-4 py-4 font-bold tracking-tight text-center border-l border-white text-orange-900 bg-orange-50/50">하의:허리</th>
                              <th scope="col" className="px-4 py-4 font-bold tracking-tight text-center text-orange-900 bg-orange-50/50">엉덩이</th>
                              <th scope="col" className="px-4 py-4 font-bold tracking-tight text-center text-orange-900 bg-orange-50/50">허벅지</th>
                              <th scope="col" className="px-4 py-4 font-bold tracking-tight text-center text-orange-900 bg-orange-50/50">하의장</th>
                              <th scope="col" className="px-4 py-4 font-bold tracking-tight text-center border-l border-white text-emerald-900 bg-emerald-50/50">후드/반팔/폴로/스웨터</th>
                              <th scope="col" className="px-4 py-4 font-bold tracking-tight text-center border-l border-gray-100">전화번호</th>
                              <th scope="col" className="px-4 py-4 font-bold tracking-tight text-center border-l border-gray-100">링크</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {students.map((student) => {
                              const m = student.measurement;
                              const hasMeasured = m && m.status !== 'pending';
                              
                              return (
                                <tr key={student.id} className="hover:bg-purple-50/30 transition-colors">
                                  <td className="px-6 py-3 font-bold text-gray-900">{student.name}</td>
                                  <td className="px-4 py-3 text-gray-500">{student.grade} / {student.class}</td>
                                  <td className="px-4 py-3 text-center">
                                    {hasMeasured ? (
                                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-none font-bold">
                                        <CheckCircle className="w-3 h-3 mr-1" /> 입력
                                      </Badge>
                                    ) : (
                                       <Badge variant="outline" className="bg-gray-100 text-gray-500 border-none font-medium">대기</Badge>
                                    )}
                                  </td>
                                  
                                  {/* 상의 데이터 */}
                                  <td className="px-4 py-3 text-center font-mono border-l border-gray-50 text-blue-800">{m?.shoulder ?? '-'}</td>
                                  <td className="px-4 py-3 text-center font-mono text-blue-800">{m?.chest ?? '-'}</td>
                                  <td className="px-4 py-3 text-center font-mono text-blue-800">{m?.upperLength ?? '-'}</td>
                                  <td className="px-4 py-3 text-center font-mono text-blue-800">{m?.sleeveLength ?? '-'}</td>
                                  
                                  {/* 하의 데이터 */}
                                  <td className="px-4 py-3 text-center font-mono border-l border-gray-50 text-orange-800">{m?.waist ?? '-'}</td>
                                  <td className="px-4 py-3 text-center font-mono text-orange-800">{m?.hip ?? '-'}</td>
                                  <td className="px-4 py-3 text-center font-mono text-orange-800">{m?.thigh ?? '-'}</td>
                                  <td className="px-4 py-3 text-center font-mono text-orange-800">{m?.pantsLength ?? '-'}</td>
                                  
                                  {/* 추가 품목 데이터 */}
                                  <td className="px-4 py-3 text-center font-mono border-l border-gray-50 text-emerald-800">
                                    {m?.qtyHoodie || 0}/{m?.qtyTshirt || 0}/{m?.qtyPolo || 0}/{m?.qtySweater || 0}
                                  </td>
                                  
                                  {/* 기본 정보 (끝) */}
                                  <td className="px-4 py-3 text-gray-400 border-l border-gray-100 font-mono text-[11px]">{student.phoneNumber || '-'}</td>
                                  <td className="px-4 py-3 text-center border-l border-gray-100">
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="h-8 w-8 p-0 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                                      onClick={() => onCopySms(student)}
                                    >
                                      <FileText className="w-4 h-4" />
                                    </Button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      )}
                    </CardContent>
                  </>
                )}
             </Card>
           )}
        </div>
      </div>
    </div>
  );
}
