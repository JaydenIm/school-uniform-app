'use client';
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { ArrowRight, Upload, Download, CheckCircle2 } from "lucide-react"
import * as XLSX from 'xlsx-js-style'
import { saveAs } from 'file-saver'
import { DataTable } from "@/components/ui/data-table"
import { columns } from "../columns"

interface StudentInfo {
  studentName: string
  birthDate: string
  phoneNumber: string
  grade: string
  class: string
  gender: string
}

export default function CreateSchool() {
  const router = useRouter()
  const { data: session, status: sessionStatus } = useSession();
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    schoolName: '',
    yearMonth: new Date().toISOString().slice(0, 7).replace(/-/g, ''),
    address: '',
    managerContact: '',
  })
  const [schoolId, setSchoolId] = useState<number | null>(null)
  const [students, setStudents] = useState<any[]>([])
  const [isDragging, setIsDragging] = useState(false)

  // 초기 로드 시 sessionStorage에서 데이터 복구
  useEffect(() => {
    const savedStep = sessionStorage.getItem('register_step');
    const savedSchoolId = sessionStorage.getItem('register_schoolId');
    const savedFormData = sessionStorage.getItem('register_formData');
    
    if (savedStep) setStep(parseInt(savedStep));
    if (savedSchoolId) setSchoolId(parseInt(savedSchoolId));
    if (savedFormData) setFormData(JSON.parse(savedFormData));
  }, []);

  // 상태 변경 시 sessionStorage 동기화
  useEffect(() => {
    sessionStorage.setItem('register_step', step.toString());
    if (schoolId) sessionStorage.setItem('register_schoolId', schoolId.toString());
    sessionStorage.setItem('register_formData', JSON.stringify(formData));
  }, [step, schoolId, formData]);

  // 세션 체크
  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      router.push('/login');
    }
  }, [sessionStatus, router]);

  const handleNextStep = async () => {
    if (!formData.schoolName || !formData.yearMonth) {
      toast.error("학교명과 등록년월은 필수입니다.")
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
        if (response.status === 401) {
           router.push('/login');
           return;
        }
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
        
        console.log('Sheet Name:', sheetName)
        console.log('Raw Excel Data:', jsonData)

        // 데이터 시작점이 어디인지 찾기 (첫 번째 열에 이름이 있는 첫 행 찾기)
        const startIndex = jsonData.findIndex(row => row && row[0] && row[0] !== '학생명' && row[0] !== '이름')
        const dataRows = startIndex !== -1 ? jsonData.slice(startIndex) : jsonData.slice(1)

        const mappedData = dataRows
          .filter(row => row && row.length > 0 && (row[0] || row[1])) // 이름이나 학년이라도 있는 경우
          .map((row: any) => ({
            studentName: row[0]?.toString() || '',
            grade: row[1]?.toString() || '',
            class: row[2]?.toString() || '',
            birthDate: row[3]?.toString() || '',
            phoneNumber: row[4]?.toString() || '',
            name: row[0]?.toString() || '', // DataTable support
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

  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false)

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
      
      // 등록 성공 시 세션 데이터 정리
      sessionStorage.removeItem('register_step')
      sessionStorage.removeItem('register_schoolId')
      sessionStorage.removeItem('register_formData')

      setShowSuccessOverlay(true)
      setTimeout(() => {
        router.push(`/settings/schools?newId=${schoolId}`)
      }, 1500)
    } catch (err: any) {
      console.error("Final submit error:", err)
      toast.error(err.message)
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl relative">
      {showSuccessOverlay && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-md z-50 flex flex-col items-center justify-center animate-in fade-in duration-500">
           <div className="bg-white p-12 rounded-3xl shadow-2xl flex flex-col items-center space-y-6 border border-gray-100 animate-in zoom-in-95 duration-500">
              <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center text-white scale-110 shadow-lg shadow-green-200">
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
          <li>계정 설정</li>
          <li className="flex items-center space-x-2">
            <ArrowRight className="w-3 h-3 mx-1" />
            <button onClick={() => router.push('/settings/schools')} className="hover:text-black">학교 관리</button>
          </li>
          <li className="flex items-center space-x-2">
            <ArrowRight className="w-3 h-3 mx-1" />
            <span className="text-black font-semibold">학교 등록</span>
          </li>
        </ol>
      </nav>

      <div className="flex items-center justify-center mb-10">
        <div className={`flex items-center ${step >= 1 ? 'text-gray-900' : 'text-gray-400'}`}>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
            style={{ background: step >= 1 ? '#4B0082' : '#d1d5db' }}
          >1</div>
          <span className="ml-2 font-medium">학교 정보</span>
        </div>
        <div className="w-20 h-[2px] mx-4 bg-gray-200">
           <div className={`h-full transition-all ${step >= 2 ? 'w-full' : 'w-0'}`} style={{ background: '#4B0082' }}></div>
        </div>
        <div className={`flex items-center ${step >= 2 ? 'text-gray-900' : 'text-gray-400'}`}>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
            style={{ background: step >= 2 ? '#4B0082' : '#d1d5db' }}
          >2</div>
          <span className="ml-2 font-medium">학생 명단</span>
        </div>
      </div>

      {step === 1 && (
        <Card className="border-none shadow-xl">
          <CardHeader className="pb-8">
            <CardTitle className="text-2xl">학교 기본 정보 등록</CardTitle>
            <CardDescription>등록하고자 하는 학교의 기초 정보를 입력해 주세요.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
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
                <Label htmlFor="yearMonth" className="text-sm font-semibold">등록년월 <span className="text-red-500">*</span></Label>
                <Input
                  id="yearMonth"
                  type="month"
                  value={formData.yearMonth.length === 6 ? formData.yearMonth.slice(0, 4) + '-' + formData.yearMonth.slice(4) : ''}
                  onChange={e => setFormData(p => ({ ...p, yearMonth: e.target.value.replace(/-/g, '') }))}
                  className="h-11"
                />
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
              <Button variant="ghost" onClick={() => router.push('/settings/schools')}>취소</Button>
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

      {step === 2 && (
        <Card className="border-none shadow-xl transition-all animate-in fade-in slide-in-from-bottom-4 duration-500">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center">
              <CheckCircle2 className="w-6 h-6 mr-2 text-green-500" />
              학생 명단 업로드
            </CardTitle>
            <CardDescription>{formData.schoolName} ({formData.yearMonth}) 학교의 학생 정보를 업로드해 주세요.</CardDescription>
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
               <Button variant="outline" onClick={downloadTemplate} className="h-11">
                  <Download className="mr-2 w-4 h-4" /> 양식 다운로드
               </Button>
            </div>

            {students.length > 0 && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-gray-700">업로드 데이터 미리보기 ({students.length}명)</h3>
                </div>
                <div className="max-h-[400px] overflow-auto border rounded-xl shadow-inner scrollbar-hide">
                   <table className="w-full text-sm text-left border-collapse">
                      <thead className="bg-gray-50 sticky top-0">
                         <tr>
                            <th className="p-3 border-b font-bold">이름</th>
                            <th className="p-3 border-b font-bold">학년</th>
                            <th className="p-3 border-b font-bold">반</th>
                            <th className="p-3 border-b font-bold">생년월일</th>
                            <th className="p-3 border-b font-bold">연락처</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y">
                         {students.map((s, i) => (
                            <tr key={i} className="hover:bg-gray-50 transition-colors">
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
                className="bg-black hover:bg-gray-800 text-white min-w-[140px]"
                disabled={students.length === 0 || isLoading}
              >
                {isLoading ? "등록 중..." : "최종 등록 완료"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}