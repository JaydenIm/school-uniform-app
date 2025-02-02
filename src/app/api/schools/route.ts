import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { schoolName, yearMonth } = body
    
    // 쿠키에서 사용자 정보 가져오기
    const cookieStore = await cookies()
    const userCookie = cookieStore.get('user')
    const user = userCookie ? JSON.parse(userCookie.value) : null

    if (!user?.id) {
      return NextResponse.json(
        { success: false, message: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    if (!schoolName || !yearMonth) {
      return NextResponse.json(
        { success: false, message: '필수 입력값이 누락되었습니다.' },
        { status: 400 }
      )
    }

    // 해당 yearMonth의 마지막 seq 조회
    const lastSchool = await prisma.schools.findFirst({
      where: { yearMonth },
      orderBy: { seq: 'desc' }
    })

    // 새로운 seq 생성 (YYYYMM00001 형식)
    const lastSeq = lastSchool ? parseInt(lastSchool.seq.slice(-5)) : 0
    const newSeq = `${yearMonth}${String(lastSeq + 1).padStart(5, '0')}`

    const school = await prisma.schools.create({
      data: {
        seq: newSeq,
        yearMonth,
        schoolName,
        userId: Number(user.id),
        useYn: 'Y',
        createdAt: new Date(),
      },
    })

    return NextResponse.json({ 
      success: true, 
      message: '학교가 등록되었습니다.',
      data: school 
    })

  } catch (error) {
    console.error('School creation error:', error)
    return NextResponse.json(
      { success: false, message: '학교 등록에 실패했습니다.' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies()
    const userCookie = cookieStore.get('user')
    const user = userCookie ? JSON.parse(userCookie.value) : null

    if (!user?.id) {
      return NextResponse.json(
        { success: false, message: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    const schools = await prisma.schools.findMany({
      where: {
        userId: user.id,
        useYn: 'Y'
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ 
      success: true, 
      data: schools 
    })

  } catch (error) {
    console.error('Schools fetch error:', error)
    return NextResponse.json(
      { success: false, message: '학교 목록 조회에 실패했습니다.' },
      { status: 500 }
    )
  }
}