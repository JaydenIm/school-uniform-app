'use client';
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Upload, Download, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react'
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
      if (!response.ok) throw new Error(result.error || "학교 등록 실패")

      setSchoolId(result.data.id)
      setStep(2)
      toast.success("학교 기본 정보가 저장되었습니다.")
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheet = workbook.Sheets[workbook.SheetNames[0]]
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[]
        
        const mappedData = jsonData.slice(1).map((row: any) => ({
          studentName: row[0] || '',
          grade: row[1] || '',
          class: row[2] || '',
          birthDate: row[3] || '',
          phoneNumber: row[4] || '',
          name: row[0], // DataTable matches 'name'
        }))

        setStudents(mappedData)
        toast.success(`${mappedData.length}명의 학생 데이터를 읽었습니다.`)
      } catch (err) {
        toast.error("엑셀 파일 파싱 오류")
      }
    }
    reader.readAsArrayBuffer(file)
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
    if (!schoolId || students.length === 0) return
    
    setIsLoading(true)
    try {
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schoolId, students }),
      })

      if (!response.ok) throw new Error("학생 등록 실패")
      
      toast.success("전체 등록이 완료되었습니다.")
      router.push('/settings/schools')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10 px-4 max-w-5xl">
      {/* Stepper Header */}
      <div className="flex items-center justify-center mb-10">
        <div className={`flex items-center ${step >= 1 ? 'text-black' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 1 ? 'border-black bg-black text-white' : 'border-gray-300'}`}>1</div>
          <span className="ml-2 font-medium">학교 정보</span>
        </div>
        <div className="w-20 h-[2px] mx-4 bg-gray-200">
           <div className={`h-full bg-black transition-all ${step >= 2 ? 'w-full' : 'w-0'}`}></div>
        </div>
        <div className={`flex items-center ${step >= 2 ? 'text-black' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 2 ? 'border-black bg-black text-white' : 'border-gray-300'}`}>2</div>
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
                  value={formData.yearMonth.slice(0, 4) + '-' + formData.yearMonth.slice(4)}
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
              <Button variant="ghost" onClick={() => router.back()}>취소</Button>
              <Button onClick={handleNextStep} disabled={isLoading} className="bg-black hover:bg-gray-800 text-white min-w-[120px]">
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
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-3 text-gray-400" />
                      <p className="mb-2 text-sm text-gray-500">파일을 클릭하거나 여기로 드래그하세요</p>
                    </div>
                    <input type="file" className="hidden" accept=".xlsx,.xls" onChange={handleFileUpload} />
                  </label>
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
                <div className="max-h-[400px] overflow-auto border rounded-lg shadow-inner">
                   <DataTable columns={columns} data={students} placeholder="데이터가 없습니다." />
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