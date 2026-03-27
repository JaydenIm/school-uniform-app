'use client';
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { ArrowRight, Upload, Download, CheckCircle2, Store, PlusCircle, MapPin, Phone } from "lucide-react"
import * as XLSX from 'xlsx-js-style'
import { saveAs } from 'file-saver'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export default function CreateSchool() {
  const router = useRouter()
  const { status: sessionStatus } = useSession();
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const currentYear = new Date().getFullYear();
  const [formData, setFormData] = useState({
    schoolName: '',
    yearMonth: `${currentYear}1`,
    address: '',
    managerContact: '',
    storeId: '',
  })
  
  // 년도/학기 개별 상태 (UI 바인딩용)
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const [selectedSemester, setSelectedSemester] = useState('1');

  // UI에서 직접 호출할 변경 함수
  const handleYearChange = (year: string) => {
    setSelectedYear(year);
    setFormData(p => ({ ...p, yearMonth: year + selectedSemester }));
  };

  const handleSemesterChange = (semester: string) => {
    setSelectedSemester(semester);
    setFormData(p => ({ ...p, yearMonth: selectedYear + semester }));
  };

  const [stores, setStores] = useState<any[]>([])
  const [schoolId, setSchoolId] = useState<number | null>(null)
  const [students, setStudents] = useState<any[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false)

  // 매장 등록 모달 상태
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false)
  const [newStore, setNewStore] = useState({ name: '', roadAddress: '', detailAddress: '', phoneNumber: '' })

  // 초기 로드 시 sessionStorage에서 데이터 복구
  useEffect(() => {
    const savedStep = sessionStorage.getItem('register_step');
    const savedSchoolId = sessionStorage.getItem('register_schoolId');
    const savedFormData = sessionStorage.getItem('register_formData');
    if (savedStep) setStep(parseInt(savedStep));
    if (savedSchoolId) setSchoolId(parseInt(savedSchoolId));
    if (savedFormData) {
      const parsed = JSON.parse(savedFormData);
      setFormData(parsed);
      if (parsed.yearMonth && parsed.yearMonth.length === 5) {
        setSelectedYear(parsed.yearMonth.slice(0, 4));
        setSelectedSemester(parsed.yearMonth.slice(4));
      }
    }
    fetchStores()
  }, []);

  // 상태 변경 시 sessionStorage 동기화
  useEffect(() => {
    sessionStorage.setItem('register_step', step.toString());
    if (schoolId) sessionStorage.setItem('register_schoolId', schoolId.toString());
    sessionStorage.setItem('register_formData', JSON.stringify(formData));
  }, [step, schoolId, formData]);

  const fetchStores = async () => {
    try {
      const res = await fetch('/api/stores')
      const data = await res.json()
      if (data.stores) setStores(data.stores)
    } catch (err) {
      console.error(err)
    }
  }

  const handleAddStore = async () => {
    if (!newStore.name || !newStore.roadAddress) {
      toast.error("매장명과 주소는 필수입니다.")
      return
    }
    setIsLoading(true)
    try {
      const res = await fetch('/api/stores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStore),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || '매장 등록 실패')
      
      toast.success('매장이 성공적으로 등록되었습니다.')
      setIsStoreModalOpen(false)
      setNewStore({ name: '', roadAddress: '', detailAddress: '', phoneNumber: '' })
      
      // 목록 갱신 및 신규 매장 자동 선택
      const freshStoresRes = await fetch('/api/stores')
      const freshData = await freshStoresRes.json()
      if (freshData.stores) {
        setStores(freshData.stores)
        setFormData(p => ({ ...p, storeId: result.store.id.toString() }))
      }
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  // 세션 체크
  useEffect(() => {
    if (sessionStatus === 'unauthenticated') router.push('/login');
  }, [sessionStatus, router]);

  const handleNextStep = async () => {
    if (!formData.schoolName || !formData.yearMonth || !formData.storeId) {
      toast.error("학교명, 등록년월, 담당 매장은 필수입니다.")
      return
    }
    setIsLoading(true)
    try {
      const response = await fetch('/api/schools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const result = await response.json()
      if (!response.ok) {
        if (response.status === 401) { router.push('/login'); return; }
        throw new Error(result.error || "학교 등록 실패")
      }
      setSchoolId(result.data.id)
      setStep(2)
      toast.success("학교 기본 정보가 저장되었습니다.")
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const processFile = (file: File) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const sheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[]

        const startIndex = jsonData.findIndex(row => row && row[0] && row[0] !== '학생명' && row[0] !== '이름')
        const dataRows = startIndex !== -1 ? jsonData.slice(startIndex) : jsonData.slice(1)

        const mappedData = dataRows
          .filter(row => row && row.length > 0 && (row[0] || row[1]))
          .map((row: any) => ({
            studentName: row[0]?.toString() || '',
            grade: row[1]?.toString() || '',
            class: row[2]?.toString() || '',
            birthDate: row[3]?.toString() || '',
            phoneNumber: row[4]?.toString() || '',
            name: row[0]?.toString() || '',
          }))

        if (mappedData.length === 0) {
          toast.error("유효한 학생 데이터가 없습니다. 양식을 확인해 주세요.")
          return
        }

        setStudents(mappedData)
        toast.success(`${mappedData.length}명의 학생 데이터를 읽었습니다.`)
      } catch (err) {
        console.error("Excel mapping error:", err)
        toast.error("엑셀 파일 파싱 중 오류가 발생했습니다.")
      }
    }
    reader.readAsArrayBuffer(file)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
      processFile(file)
    } else if (file) {
      toast.error('엑셀 파일(.xlsx, .xls)만 업로드 가능합니다.')
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const downloadTemplate = () => {
    const data = [
      ['학생명', '학년', '반', '생년월일(YYYYMMDD)', '연락처'],
      ['홍길동', '1', '3', '20100101', '010-1234-5678']
    ]
    const ws = XLSX.utils.aoa_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1")
    const buf = XLSX.write(wb, { type: 'array', bookType: 'xlsx' })
    saveAs(new Blob([buf]), '학생명단_업로드양식.xlsx')
  }

  const handleFinalSubmit = async () => {
    if (!schoolId) {
      toast.error("학교 정보가 누락되었습니다. 첫 단계부터 다시 진행해 주세요.")
      return
    }
    if (students.length === 0) {
      toast.error("등록할 학생이 없습니다.")
      return
    }
    setIsLoading(true)
    try {
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schoolId, students }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.message || "학생 등록 실패")

      sessionStorage.removeItem('register_step')
      sessionStorage.removeItem('register_schoolId')
      sessionStorage.removeItem('register_formData')

      setShowSuccessOverlay(true)
      setTimeout(() => {
        router.push(`/schools?newId=${schoolId}`)
      }, 1500)
    } catch (err: any) {
      console.error("Final submit error:", err)
      toast.error(err.message)
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl relative">
      {/* 성공 오버레이 */}
      {showSuccessOverlay && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-md z-50 flex flex-col items-center justify-center animate-in fade-in duration-500">
           <div className="bg-white p-12 rounded-3xl shadow-2xl flex flex-col items-center space-y-6 border border-gray-100">
              <div className="w-24 h-24 rounded-full flex items-center justify-center text-white shadow-lg" style={{ background: '#4B0082' }}>
                 <CheckCircle2 className="w-12 h-12" />
              </div>
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold">등록 완료!</h2>
                <p className="text-gray-500">모든 정보가 성공적으로 저장되었습니다.<br/>잠시 후 목록 페이지로 이동합니다.</p>
              </div>
           </div>
        </div>
      )}

      {/* Breadcrumbs */}
      <nav className="flex mb-8 text-sm text-gray-500" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2">
          <li>
            <button onClick={() => router.push('/schools')} className="hover:text-gray-900">학교 관리</button>
          </li>
          <li className="flex items-center space-x-2">
            <ArrowRight className="w-3 h-3 mx-1" />
            <span className="text-gray-900 font-semibold">학교 등록</span>
          </li>
        </ol>
      </nav>

      {/* Stepper */}
      <div className="flex items-center justify-center mb-10">
        <div className={`flex items-center ${step >= 1 ? 'text-gray-900' : 'text-gray-400'}`}>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
            style={{ background: step >= 1 ? '#4B0082' : '#d1d5db' }}
          >1</div>
          <span className="ml-2 font-medium">학교 정보</span>
        </div>
        <div className="w-20 h-[2px] mx-4 bg-gray-200">
           <div className={`h-full transition-all duration-500 ${step >= 2 ? 'w-full' : 'w-0'}`} style={{ background: '#4B0082' }} />
        </div>
        <div className={`flex items-center ${step >= 2 ? 'text-gray-900' : 'text-gray-400'}`}>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
            style={{ background: step >= 2 ? '#4B0082' : '#d1d5db' }}
          >2</div>
          <span className="ml-2 font-medium">학생 명단</span>
        </div>
      </div>

      {/* Step 1: 학교 정보 */}
      {step === 1 && (
        <Card className="border-none shadow-xl">
          <CardHeader className="pb-8">
            <CardTitle className="text-2xl">학교 기본 정보 등록</CardTitle>
            <CardDescription>등록하고자 하는 학교의 기초 정보를 입력해 주세요.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2 col-span-2">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-semibold">담당 매장 <span className="text-red-500">*</span></Label>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 text-xs text-purple-600 hover:text-purple-700 font-bold"
                    onClick={() => setIsStoreModalOpen(true)}
                  >
                    <PlusCircle className="mr-1 w-3 h-3" /> 신규 매장 추가
                  </Button>
                </div>
                <Select 
                  value={formData.storeId} 
                  onValueChange={v => setFormData(p => ({ ...p, storeId: v }))}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="학교를 관리할 매장을 선택해 주세요" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {stores.map(s => (
                      <SelectItem key={s.id} value={s.id.toString()}>
                        <div className="flex items-center gap-2">
                          <Store className="w-3.5 h-3.5 text-purple-600" />
                          <span>{s.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                    {stores.length === 0 && <SelectItem value="none" disabled>먼저 매장을 등록해 주세요</SelectItem>}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label htmlFor="schoolName" className="text-sm font-semibold">학교명 <span className="text-red-500">*</span></Label>
                <Input
                  id="schoolName"
                  placeholder="예: 서울고등학교"
                  value={formData.schoolName}
                  onChange={e => setFormData(p => ({ ...p, schoolName: e.target.value }))}
                  className="h-11"
                />
              </div>
              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label className="text-sm font-semibold">년도/학기 <span className="text-red-500">*</span></Label>
                <div className="flex gap-2">
                  <Select value={selectedYear} onValueChange={handleYearChange}>
                    <SelectTrigger className="h-11 flex-1">
                      <SelectValue placeholder="년도" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {Array.from({ length: 5 }, (_, i) => currentYear - 2 + i).map(year => (
                        <SelectItem key={year} value={year.toString()}>{year}년</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedSemester} onValueChange={handleSemesterChange}>
                    <SelectTrigger className="h-11 flex-1">
                      <SelectValue placeholder="학기" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="1">1학기</SelectItem>
                      <SelectItem value="2">2학기</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="address" className="text-sm font-semibold">학교 주소</Label>
                <Input
                  id="address"
                  placeholder="도로명 주소 등을 입력하세요"
                  value={formData.address}
                  onChange={e => setFormData(p => ({ ...p, address: e.target.value }))}
                  className="h-11"
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="contact" className="text-sm font-semibold">담당자 연락처</Label>
                <Input
                  id="contact"
                  placeholder="예: 010-1234-5678"
                  value={formData.managerContact}
                  onChange={e => setFormData(p => ({ ...p, managerContact: e.target.value }))}
                  className="h-11"
                />
              </div>
            </div>

            <div className="flex justify-between pt-6 border-t">
              <Button variant="ghost" onClick={() => router.push('/schools')}>취소</Button>
              <Button
                onClick={handleNextStep}
                disabled={isLoading}
                className="text-white min-w-[120px] hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #4B0082, #6A0DAD)' }}
              >
                {isLoading ? "처리 중..." : (
                  <span className="flex items-center">다음 단계 <ArrowRight className="ml-2 w-4 h-4" /></span>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: 학생 명단 업로드 */}
      {step === 2 && (
        <Card className="border-none shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center">
              <CheckCircle2 className="w-6 h-6 mr-2 text-green-500" />
              학생 명단 업로드
            </CardTitle>
            <CardDescription>
              {formData.schoolName} 학교의 학생 정보를 업로드해 주세요.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 w-full">
                <Label className="text-xs font-bold mb-2 block text-gray-500">엑셀 파일 (.xlsx, .xls)</Label>
                <div
                  className="relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200"
                  style={{
                    borderColor: isDragging ? '#4B0082' : '#d1d5db',
                    background: isDragging ? '#EBE0FF' : '#f9fafb',
                  }}
                  onDragOver={handleDragOver}
                  onDragEnter={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('file-upload-input')?.click()}
                >
                  <Upload className="w-8 h-8 mb-2" style={{ color: isDragging ? '#4B0082' : '#9ca3af' }} />
                  <p className="text-sm" style={{ color: isDragging ? '#4B0082' : '#6b7280' }}>
                    {isDragging ? '여기에 파일을 놓으세요!' : '클릭하거나 파일을 드래그하세요'}
                  </p>
                  <input
                    id="file-upload-input"
                    type="file"
                    className="hidden"
                    accept=".xlsx,.xls"
                    onChange={handleFileUpload}
                  />
                </div>
              </div>
              <Button variant="outline" onClick={downloadTemplate} className="h-11 shrink-0">
                <Download className="mr-2 w-4 h-4" /> 양식 다운로드
              </Button>
            </div>

            {/* 미리보기 테이블 */}
            {students.length > 0 && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-gray-700">업로드 데이터 미리보기</h3>
                  <span className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-full border border-purple-100 font-medium">
                    {students.length}명
                  </span>
                </div>
                <div className="max-h-[380px] overflow-auto border rounded-xl shadow-inner scrollbar-hide">
                  <table className="w-full text-sm text-left border-collapse">
                    <thead className="sticky top-0" style={{ background: '#4B0082' }}>
                      <tr>
                        {['이름', '학년', '반', '생년월일', '연락처'].map(h => (
                          <th key={h} className="p-3 font-semibold text-white">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {students.map((s, i) => (
                        <tr key={i} className="hover:bg-purple-50 transition-colors">
                          <td className="p-3">{s.studentName}</td>
                          <td className="p-3">{s.grade}</td>
                          <td className="p-3">{s.class}</td>
                          <td className="p-3">{s.birthDate}</td>
                          <td className="p-3">{s.phoneNumber}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-6 border-t">
              <Button variant="ghost" onClick={() => setStep(1)} disabled={isLoading}>이전 단계</Button>
              <Button
                onClick={handleFinalSubmit}
                className="text-white min-w-[140px] hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #4B0082, #6A0DAD)' }}
                disabled={students.length === 0 || isLoading}
              >
                {isLoading ? "등록 중..." : "최종 등록 완료"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      {/* 매장 등록 모달 */}
      <Dialog open={isStoreModalOpen} onOpenChange={setIsStoreModalOpen}>
        <DialogContent className="max-w-md bg-white rounded-3xl p-6 overflow-hidden border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black flex items-center gap-2">
              <Store className="w-5 h-5 text-purple-700" /> 매장 신규 등록
            </DialogTitle>
            <DialogDescription>
              오프라인 매장 정보를 입력해 주세요.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-gray-500">매장명 (업체명)</Label>
              <Input 
                value={newStore.name} 
                onChange={e => setNewStore(p => ({ ...p, name: e.target.value }))}
                placeholder="예: 온핏 청담점"
                className="h-11"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-gray-500">도로명 주소</Label>
              <div className="relative">
                <Input 
                  value={newStore.roadAddress} 
                  onChange={e => setNewStore(p => ({ ...p, roadAddress: e.target.value }))}
                  placeholder="예: 서울특별시 강남구..."
                  className="h-11 pl-10"
                />
                <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-gray-400">상세 주소</Label>
              <Input 
                value={newStore.detailAddress} 
                onChange={e => setNewStore(p => ({ ...p, detailAddress: e.target.value }))}
                placeholder="예: 2층"
                className="h-11"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-gray-500">연락처</Label>
              <div className="relative">
                <Input 
                  value={newStore.phoneNumber} 
                  onChange={e => setNewStore(p => ({ ...p, phoneNumber: e.target.value }))}
                  placeholder="예: 02-1234-5678"
                  className="h-11 pl-10"
                />
                <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          </div>
          <DialogFooter className="pt-4">
            <Button 
              onClick={handleAddStore} 
              disabled={isLoading}
              className="w-full bg-purple-800 text-white font-bold h-12 rounded-xl hover:bg-purple-900"
            >
              {isLoading ? "등록 중..." : "등록 완료"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
