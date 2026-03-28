import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET /api/stores — 현재 사용자의 매장 목록 조회
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
  }

  try {
    const user = await prisma.users.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 })
    }

    if (user.role === 'STAFF' && user.staffStatus !== 'active') {
      return NextResponse.json({ error: '승인 대기 중이거나 권한이 정지되었습니다.' }, { status: 403 })
    }

    const isAdmin = user.role === 'ADMIN';
    const effectiveUserId = user.role === 'STAFF' ? user.parentUserId! : user.id;

    const whereClause: any = { useYn: 'Y' };
    if (!isAdmin) {
      whereClause.userId = effectiveUserId;
    }

    const stores = await prisma.stores.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ stores })
  } catch (error) {
    console.error('GET /api/stores:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}

// POST /api/stores — 새 매장 등록
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
  }

  try {
    const user = await prisma.users.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 })
    }

    if (user.role === 'STAFF' && user.staffStatus !== 'active') {
      return NextResponse.json({ error: '권한이 없습니다 (승인 거절 또는 대기중)' }, { status: 403 })
    }

    const effectiveUserId = user.role === 'STAFF' ? user.parentUserId! : user.id;

    const body = await req.json()
    const { name, roadAddress, detailAddress, phoneNumber } = body

    if (!name || !roadAddress) {
      return NextResponse.json({ error: '매장명과 주소는 필수입니다.' }, { status: 400 })
    }

    const store = await prisma.stores.create({
      data: {
        name,
        roadAddress,
        detailAddress: detailAddress || '',
        phoneNumber: phoneNumber || '',
        userId: effectiveUserId,
      },
    })

    return NextResponse.json({ store })
  } catch (error) {
    console.error('POST /api/stores:', error)
    return NextResponse.json({ error: '매장 등록 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
