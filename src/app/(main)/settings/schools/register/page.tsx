'use client';
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import * as XLSX from 'xlsx-js-style'
import { TabulatorFull as Tabulator } from 'tabulator-tables'
import "tabulator-tables/dist/css/tabulator.min.css"
import { saveAs } from 'file-saver'

interface Student {
  studentName: string
  birthDate: string
  gender: string
  phoneNumber: string
  [key: string]: string
}

export default function CreateSchool() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [registeredSchool, setRegisteredSchool] = useState<any>(null)
  const [students, setStudents] = useState<Student[]>([])
  const tableRef = useRef<any>(null)
  const [formData, setFormData] = useState({
    schoolName: '',
    yearMonth: new Date().toISOString().slice(0, 7).replace(/-/g, ''),
  })
  const [table, setTable] = useState<any>(null)

  useEffect(() => {
    if (students.length > 0 && tableRef.current) {
      const newTable = new Tabulator(tableRef.current, {
        data: students,
        layout: "fitColumns",
        height: "400px",
        columns: [
          { title: "학생명", field: "studentName", editor: "input", validator: "required" },
          { title: "생년월일", field: "birthDate", editor: "input", validator: "required" },
          { 
            title: "성별", 
            field: "gender", 
            editor: "list", 
            editorParams: { values: ["남", "여"] }
          },
          { 
            title: "연락처", 
            field: "phoneNumber", 
            editor: "input",
            validator: "regex:^\\d{2,3}-\\d{3,4}-\\d{4}$",
            validatorParams: {
              message: "올바른 전화번호 형식이 아닙니다 (예: 010-1234-5678)"
            }
          },
        ],
        validationMode: "highlight",
      })
      setTable(newTable)
    }
  }, [students])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/schools', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || '학교 등록에 실패했습니다.')
      }

      const school = await response.json()
      setRegisteredSchool(school)
      toast.success("학교가 성공적으로 등록되었습니다.")
    } catch (error: any) {
      toast.error(error.message || "오류가 발생했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  const downloadTemplate = () => {
    const template = XLSX.utils.book_new()
    const templateData = [
      ['학생명', '생년월일', '전화번호'], // 헤더
      ['홍길동', '20100101', '010-1234-5678'], // 예시 데이터
    ]
    
    const worksheet = XLSX.utils.aoa_to_sheet(templateData)
    XLSX.utils.book_append_sheet(template, worksheet, '학생정보')
    
    // Generate buffer
    const excelBuffer = XLSX.write(template, { bookType: 'xlsx', type: 'array' })
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    
    // Download file
    saveAs(data, '학생정보_업로드양식.xlsx')
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[]
        
        // 첫 번째 행(헤더) 제외하고 데이터 처리
        const validatedData = jsonData.slice(1).map((row: any) => ({
          studentName: row[0] || '',
          birthDate: row[1] || '',
          phoneNumber: row[2] || '',
          gender: '', // 기본값 추가
        }))

        setStudents(validatedData)
        toast.success(`${validatedData.length}명의 학생 정보를 읽었습니다.`)
      } catch (error) {
        toast.error("엑셀 파일 처리 중 오류가 발생했습니다.")
        console.error(error)
      }
    }
    reader.readAsArrayBuffer(file)
  }

  const handleUploadStudents = async () => {
    if (!registeredSchool?.data?.id || !table) {
      toast.error('학교 정보가 없거나 학생 데이터가 없습니다.');
      return;
    }

    const tableData = table.getData();
    if (!tableData.length) {
      toast.error('등록할 학생 데이터가 없습니다.');
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          schoolId: registeredSchool.data.id,
          students: tableData,
        }),
      });

      if (!response.ok) {
        throw new Error('학생 등록에 실패했습니다.');
      }

      toast.success("학생 정보가 성공적으로 등록되었습니다.");
      router.push('/settings/schools');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-4xl mx-auto mb-6">
        <CardHeader>
          <CardTitle>학교 등록</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="schoolName">학교명</Label>
              <Input
                id="schoolName"
                value={formData.schoolName}
                onChange={(e) => setFormData(prev => ({ ...prev, schoolName: e.target.value }))}
                required
                placeholder="학교명을 입력하세요"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="yearMonth">등록년월</Label>
              <Input
                id="yearMonth"
                type="month"
                value={formData.yearMonth.slice(0, 4) + '-' + formData.yearMonth.slice(4)}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  yearMonth: e.target.value.replace(/-/g, '')
                }))}
                required
              />
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/settings/schools')}
              >
                취소
              </Button>
              <Button
                type="submit"
                variant="default"
                className="bg-black hover:bg-gray-900 text-white"
              >
                등록
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {registeredSchool && (
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>학생 정보 업로드</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                  className="max-w-xs"
                />
                <Button
                  onClick={handleUploadStudents}
                  disabled={students.length === 0 || isLoading}
                  variant="default"
                  className="bg-black hover:bg-gray-900 text-white"
                >
                  {isLoading ? '업로드 중...' : '학생 등록'}
                </Button>
                <Button
                  variant="outline"
                  onClick={downloadTemplate}
                >
                  업로드 양식 다운로드
                </Button>
              </div>
              
              <div ref={tableRef} className="mt-4"></div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 