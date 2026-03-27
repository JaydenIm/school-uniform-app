'use client';

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { DataTable } from "@/components/ui/data-table";
import { getColumns, Student } from "./columns";
import { PlusCircle, School as SchoolIcon, ChevronRight, LayoutGrid, ListFilter, Users, CheckCircle, Info, SendIcon, Copy, MapPin, Phone, Calendar } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StoreIcon } from 'lucide-react';

interface School {
  id: number;
  seq: string;
  yearMonth: string;
  schoolName: string;
  userId: number;
  storeId?: number;
  storeName?: string;
  store?: {
    name: string;
    roadAddress: string;
    detailAddress: string;
    phoneNumber: string;
  };
  useYn: string;
  status: 'active' | 'closed';
  createdAt: string;
  studentCount: number;
  measuredCount: number;
}

/** yearMonth(YYYYMM 또는 YYYYS) → 'YYYY년 MM월' 또는 'YYYY년 S학기' */
function formatYearMonth(ym: string): string {
  if (!ym) return ym;
  if (ym.length === 5) {
    return `${ym.slice(0, 4)}년 ${ym.slice(4)}학기`;
  }
  if (ym.length === 6) {
    return `${ym.slice(0, 4)}년 ${ym.slice(4)}월`;
  }
  return ym;
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

  // 필터 상태
  const currentYear = new Date().getFullYear();
  const [filterYear, setFilterYear] = useState<string>('all');
  const [filterSemester, setFilterSemester] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // 필터링된 학교 목록 계산
  const filteredSchools = schools.filter(school => {
    const matchYear = filterYear === 'all' || school.yearMonth.startsWith(filterYear);
    // 학기는 yearMonth가 5자리일 때 마지막 자리와 비교
    const matchSemester = filterSemester === 'all' || (school.yearMonth.length === 5 && school.yearMonth.endsWith(filterSemester));
    const matchStatus = filterStatus === 'all' || school.status === filterStatus;
    return matchYear && matchSemester && matchStatus;
  });

  // SMS 모달 상태
  const [isSmsModalOpen, setIsSmsModalOpen] = useState(false);
  const [smsInfo, setSmsInfo] = useState({
    companyName: '온핏 유니폼',
    address: '서울특별시 강남구 테헤란로 123',
    detailAddress: '온핏빌딩 5층',
    contact: '02-1234-5678',
    dueDate: '2025-03-31'
  });

  // SMS 모달 상태


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
    } else if (filteredSchools.length > 0) {
      // 선택된 학교가 없거나, 현재 필터링된 목록에 없으면 첫 번째 항목 선택
      const isStillVisible = filteredSchools.some(s => s.id === selectedSchoolId);
      if (!selectedSchoolId || !isStillVisible) {
        setSelectedSchoolId(filteredSchools[0].id);
      }
    } else {
      setSelectedSchoolId(null);
    }
  }, [schools, filteredSchools, selectedSchoolId, searchParams, router]);

  useEffect(() => {
    if (selectedSchoolId) fetchStudents(selectedSchoolId);
    else setStudents([]);
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

  const onCopySms = (student: Student) => {
    if (!student.token) return;
    
    const measureUrl = `${window.location.origin}/measure/${student.token}`;
    const message = `[온핏 시스템 안내]\n\n` +
      `안녕하세요, ${selectedSchool?.schoolName} 학생 여러분.\n` +
      `${smsInfo.companyName}입니다.\n\n` +
      `교복 치수 측정을 위해 아래 기간 내 매장을 방문해 주시기 바랍니다.\n\n` +
      `📍 주소: ${smsInfo.address} ${smsInfo.detailAddress}\n` +
      `📞 연락처: ${smsInfo.contact}\n` +
      `🗓️ 방문기한: ${smsInfo.dueDate}까지\n\n` +
      `🔗 나만의 측정 링크:\n` +
      `${measureUrl}`;
    
    navigator.clipboard.writeText(message);
    toast.success(`${student.name} 학생의 안내 문구를 복사했습니다.`);
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
            <span className="text-gray-900 font-semibold">측정 현황 및 발송</span>
          </li>
        </ol>
      </nav>

      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">측정 현황 및 발송</h1>
          <p className="text-gray-500 mt-1">학생들의 치수 측정 진행률을 확인하고 안내 문자를 발송합니다.</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline"
            className="border-purple-200 text-purple-700 font-bold rounded-xl h-11 px-5 hover:bg-purple-50"
            onClick={() => router.push('/stores')}
          >
            <StoreIcon className="mr-2 w-4 h-4" /> 매장 관리
          </Button>
          <Button 
            className="bg-purple-800 text-white font-bold rounded-xl h-11 px-5 hover:bg-purple-900 shadow-lg shadow-purple-200"
            onClick={() => router.push('/schools/register')}
          >
            <PlusCircle className="mr-2 w-4 h-4" /> 학교 신규 등록
          </Button>
        </div>
      </div>

      {/* SMS 발송 모달 */}
      <Dialog open={isSmsModalOpen} onOpenChange={setIsSmsModalOpen}>
        <DialogContent className="max-w-2xl bg-white rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-gradient-to-br from-purple-800 to-indigo-900 p-8 text-white relative">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black flex items-center gap-2 text-white">
                <SendIcon className="w-6 h-6" /> QR/안내 문자 생성
              </DialogTitle>
              <DialogDescription className="text-purple-200 font-medium">
                {selectedSchool?.storeName} 매장 정보가 기본 적용되었습니다. 필요 시 수정 가능합니다.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-8 grid grid-cols-2 gap-8">
            {/* 왼쪽: 정보 입력 */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-gray-400">업체명</Label>
                <div className="relative">
                  <Input 
                    value={smsInfo.companyName} 
                    onChange={e => setSmsInfo(p => ({ ...p, companyName: e.target.value }))}
                    className="h-11 pl-10 border-gray-100 bg-gray-50/50 rounded-xl focus:ring-purple-500"
                  />
                  <SchoolIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-gray-400">도로명 주소</Label>
                <div className="relative">
                  <Input 
                    value={smsInfo.address} 
                    onChange={e => setSmsInfo(p => ({ ...p, address: e.target.value }))}
                    className="h-11 pl-10 border-gray-100 bg-gray-50/50 rounded-xl focus:ring-purple-500"
                  />
                  <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-gray-400">상세 주소</Label>
                <Input 
                  value={smsInfo.detailAddress} 
                  onChange={e => setSmsInfo(p => ({ ...p, detailAddress: e.target.value }))}
                  className="h-11 border-gray-100 bg-gray-50/50 rounded-xl focus:ring-purple-500"
                  placeholder="예: 2층 온핏 매장"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-gray-400">연락처</Label>
                  <div className="relative">
                    <Input 
                      value={smsInfo.contact} 
                      onChange={e => setSmsInfo(p => ({ ...p, contact: e.target.value }))}
                      className="h-11 pl-10 border-gray-100 bg-gray-50/50 rounded-xl focus:ring-purple-500"
                    />
                    <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-gray-400">방문 기한</Label>
                  <div className="relative">
                    <Input 
                      type="date"
                      value={smsInfo.dueDate} 
                      onChange={e => setSmsInfo(p => ({ ...p, dueDate: e.target.value }))}
                      className="h-11 pl-10 border-gray-100 bg-gray-50/50 rounded-xl focus:ring-purple-500"
                    />
                    <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* 오른쪽: 미리보기 */}
            <div className="bg-gray-50 rounded-2xl p-6 space-y-3 border border-gray-100 flex flex-col">
              <Label className="text-xs font-bold text-gray-400 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> 메시지 미리보기
              </Label>
              <div className="flex-1 bg-white border border-gray-100 rounded-xl p-4 text-[13px] leading-relaxed text-gray-600 font-medium font-mono whitespace-pre-wrap overflow-auto">
                {`[온핏 시스템 안내]\n\n`}
                {`안녕하세요, ${selectedSchool?.schoolName} 학생 여러분.\n`}
                {`${smsInfo.companyName}입니다.\n\n`}
                {`교복 치수 측정을 위해 아래 기간 내 매장을 방문해 주시기 바랍니다.\n\n`}
                {`📍 주소: ${smsInfo.address} ${smsInfo.detailAddress}\n`}
                {`📞 연락처: ${smsInfo.contact}\n`}
                {`🗓️ 방문기한: ${smsInfo.dueDate}까지\n\n`}
                {`🔗 나만의 측정 링크:\n`}
                {`http://localhost:3000/measure/[학생고유번호]`}
              </div>
              <p className="text-[10px] text-amber-600 font-bold bg-amber-50 p-2 rounded-lg">
                ※ 실제 발송 시 [학생고유번호] 자리에 각 학생별 자동 생성된 링크가 삽입됩니다.
              </p>
            </div>
          </div>

          <DialogFooter className="p-8 bg-gray-50/50 border-t border-gray-100 sm:justify-start">
            <Button 
              className="bg-purple-800 text-white rounded-xl h-12 px-8 font-bold hover:bg-purple-900 transition-all"
              onClick={() => {
                toast.success('설정이 저장되었습니다. 이제 학생별로 문구를 복사할 수 있습니다.');
                setIsSmsModalOpen(false);
              }}
            >
              설정 완료
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>




      {schools.length > 0 ? (
        /* 2단 그리드: 학교 목록(1/3) + 학생 목록(2/3) */
        <div className="grid grid-cols-3 gap-6 items-start">
          {/* 왼쪽: 학교 목록 */}
          <div className="col-span-1 space-y-4">
            {/* 필터 영역 */}
            <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 space-y-3">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <ListFilter className="w-3.5 h-3.5" />
                <span className="text-[11px] font-bold uppercase tracking-wider">상세 필터링</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Select value={filterYear} onValueChange={setFilterYear}>
                  <SelectTrigger className="h-9 text-xs bg-white border-none shadow-sm rounded-lg">
                    <SelectValue placeholder="년도" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="all">전체 년도</SelectItem>
                    {Array.from({ length: 5 }, (_, i) => currentYear - 2 + i).map(y => (
                      <SelectItem key={y} value={y.toString()}>{y}년</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterSemester} onValueChange={setFilterSemester}>
                  <SelectTrigger className="h-9 text-xs bg-white border-none shadow-sm rounded-lg">
                    <SelectValue placeholder="학기" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="all">전체 학기</SelectItem>
                    <SelectItem value="1">1학기</SelectItem>
                    <SelectItem value="2">2학기</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="h-9 text-xs bg-white border-none shadow-sm rounded-lg">
                  <SelectValue placeholder="진행 상태" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="all">전체 상태</SelectItem>
                  <SelectItem value="active">진행 중 (Active)</SelectItem>
                  <SelectItem value="closed">마감 (Closed)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between px-1">
              <h2 className="text-sm font-bold flex items-center text-gray-700">
                <SchoolIcon className="w-4 h-4 mr-2" /> 학교 목록
              </h2>
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">검색 {filteredSchools.length} / 총 {schools.length}</span>
            </div>
            
            <div className="space-y-3 overflow-auto max-h-[700px] pr-1">
              {filteredSchools.map((school) => {
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
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-10 text-xs font-bold border-gray-200 hover:bg-gray-50"
                        onClick={() => {
                          if (selectedSchool?.store) {
                            setSmsInfo(p => ({
                              ...p,
                              companyName: selectedSchool.store?.name || p.companyName,
                              address: selectedSchool.store?.roadAddress || p.address,
                              detailAddress: selectedSchool.store?.detailAddress || p.detailAddress,
                              contact: selectedSchool.store?.phoneNumber || p.contact,
                            }));
                          }
                          setIsSmsModalOpen(true);
                        }}
                      >
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
                          columns={getColumns(onCopySms)}
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
