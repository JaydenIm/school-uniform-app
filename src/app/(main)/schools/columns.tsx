"use client"

import { ColumnDef } from "@tanstack/react-table"

export type Student = {
  id: number
  name: string
  birthDate: string
  phoneNumber: string
  grade?: string
  class?: string
  token?: string
}

export const columns: ColumnDef<Student>[] = [
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
    id: "qr",
    header: "QR 코드",
    cell: ({ row }) => {
      const student = row.original
      if (!student.token) return null
      return (
        <a 
          href={`/measure/${student.token}`} 
          target="_blank" 
          rel="noreferrer"
          className="text-purple-600 hover:text-purple-800 underline flex items-center gap-1 text-xs"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
          </svg>
          테스트
        </a>
      )
    }
  },
]
