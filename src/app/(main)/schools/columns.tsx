"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Copy, QrCode } from "lucide-react"

export type Student = {
  id: number
  name: string
  birthDate: string
  phoneNumber: string
  gender?: string
  grade?: string
  class?: string
  token?: string
}

export const getColumns = (onCopySms: (student: Student) => void): ColumnDef<Student>[] => [
  {
    accessorKey: "name",
    header: "이름",
  },
  {
    accessorKey: "grade",
    header: "학년",
  },
  {
    accessorKey: "class",
    header: "반",
  },
  {
    accessorKey: "birthDate",
    header: "생년월일",
  },
  {
    accessorKey: "phoneNumber",
    header: "연락처",
  },
  {
    id: "actions",
    header: "QR 및 발송",
    cell: ({ row }) => {
      const student = row.original
      if (!student.token) return null
      
      const measureUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/measure/${student.token}`
      
      return (
        <div className="flex items-center gap-3">
          {/* 테스트 링크 */}
          <a 
            href={measureUrl} 
            target="_blank" 
            rel="noreferrer"
            className="text-purple-600 hover:text-purple-800 transition-colors flex items-center gap-1.5 text-[11px] font-bold bg-purple-50 px-2 py-1 rounded-md"
          >
            <QrCode className="w-3.5 h-3.5" />
            테스트
          </a>

          {/* SMS 문구 복사 버튼 */}
          <button
            onClick={() => onCopySms(student)}
            className="text-emerald-600 hover:text-emerald-800 transition-colors flex items-center gap-1.5 text-[11px] font-bold bg-emerald-50 px-2 py-1 rounded-md"
            title="안내 문자 복사"
          >
            <Copy className="w-3.5 h-3.5" />
            문구 복사
          </button>
        </div>
      )
    }
  },
]
