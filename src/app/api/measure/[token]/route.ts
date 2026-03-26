import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET /api/measure/[token] — 학생 정보 + 기존 치수 조회 (인증 불필요)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  try {
    const student = await prisma.students.findUnique({
      where: { token },
      include: {
        school: { select: { schoolName: true, yearMonth: true } },
        measurement: true,
      },
    })

    if (!student || student.useYn !== 'Y') {
      return NextResponse.json({ error: '유효하지 않은 QR 코드입니다.' }, { status: 404 })
    }

    return NextResponse.json({ student })
  } catch (error) {
    console.error('GET /api/measure/[token]:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}

// POST /api/measure/[token] — 치수 저장 (upsert)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  try {
    const student = await prisma.students.findUnique({ where: { token } })
    if (!student) {
      return NextResponse.json({ error: '유효하지 않은 QR 코드입니다.' }, { status: 404 })
    }

    const body = await request.json()
    const {
      gender,
      shoulder, chest, upperLength, sleeveLength,
      waist, hip, thigh, pantsLength,
      qtyHoodie, qtyTshirt, qtyPolo, qtySweater,
      note,
    } = body

    // 성별이 넘어왔고, 학생 정보에 성별이 없거나 다를 경우 업데이트
    if (gender && student.gender !== gender) {
      await prisma.students.update({
        where: { id: student.id },
        data: { gender }
      })
    }

    const measurement = await prisma.measurement.upsert({
      where: { studentId: student.id },
      create: {
        studentId: student.id,
        shoulder: shoulder ?? null,
        chest: chest ?? null,
        upperLength: upperLength ?? null,
        sleeveLength: sleeveLength ?? null,
        waist: waist ?? null,
        hip: hip ?? null,
        thigh: thigh ?? null,
        pantsLength: pantsLength ?? null,
        qtyHoodie: qtyHoodie ?? 0,
        qtyTshirt: qtyTshirt ?? 0,
        qtyPolo: qtyPolo ?? 0,
        qtySweater: qtySweater ?? 0,
        note: note ?? null,
        status: 'measured',
        measuredAt: new Date(),
      },
      update: {
        shoulder: shoulder ?? null,
        chest: chest ?? null,
        upperLength: upperLength ?? null,
        sleeveLength: sleeveLength ?? null,
        waist: waist ?? null,
        hip: hip ?? null,
        thigh: thigh ?? null,
        pantsLength: pantsLength ?? null,
        qtyHoodie: qtyHoodie ?? 0,
        qtyTshirt: qtyTshirt ?? 0,
        qtyPolo: qtyPolo ?? 0,
        qtySweater: qtySweater ?? 0,
        note: note ?? null,
        status: 'measured',
        measuredAt: new Date(),
      },
    })

    return NextResponse.json({ measurement })
  } catch (error) {
    console.error('POST /api/measure/[token]:', error)
    return NextResponse.json({ error: '저장 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
