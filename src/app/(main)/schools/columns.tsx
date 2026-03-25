"use client"

import { ColumnDef } from "@tanstack/react-table"

export type Student = {
  id: number
  name: string
  birthDate: string
  phoneNumber: string
  grade?: string
  class?: string
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
]
