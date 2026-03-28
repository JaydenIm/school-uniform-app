import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const schoolId = searchParams.get('schoolId');

    if (!schoolId) {
      return NextResponse.json({ error: "학교 ID가 필요합니다." }, { status: 400 });
    }

    const isAdmin = session.user.role === 'ADMIN';
    const isStaff = session.user.role === 'STAFF';
    // @ts-ignore - session.user.parentUserId is added but TS might complain
    const effectiveUserId = isStaff ? session.user.parentUserId : parseInt(session.user.id);

    // 1. 학교 검증 로직
    const school = await prisma.schools.findUnique({
      where: { id: parseInt(schoolId) }
    });

    if (!school) {
      return NextResponse.json({ error: "학교를 찾을 수 없습니다." }, { status: 404 });
    }

    if (!isAdmin && school.userId !== effectiveUserId) {
      return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
    }

    // 2. 학생 및 측정 데이터 로드
    const students = await prisma.students.findMany({
      where: {
        schoolId: parseInt(schoolId),
        useYn: 'Y'
      },
      include: {
        measurement: true
      },
      orderBy: [
        { grade: 'asc' },
        { class: 'asc' },
        { name: 'asc' }
      ]
    });

    return NextResponse.json({ success: true, data: students });
  } catch (error) {
    console.error("Measurements fetch error:", error);
    return NextResponse.json({ error: "데이터를 불러오는 중 오류가 발생했습니다." }, { status: 500 });
  }
}
