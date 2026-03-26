import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 })
    }

    const { id } = await params
    const { status } = await request.json()

    if (!['active', 'closed'].includes(status)) {
      return NextResponse.json({ error: "유효하지 않은 상태값입니다." }, { status: 400 })
    }

    const updatedSchool = await prisma.schools.update({
      where: { id: parseInt(id) },
      data: { status }
    })

    return NextResponse.json({ success: true, data: updatedSchool })
  } catch (error) {
    console.error("PATCH /api/schools/[id]/status:", error)
    return NextResponse.json({ error: "상태 변경에 실패했습니다." }, { status: 500 })
  }
}
