import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    const schools = await prisma.schools.findMany({
      where: {
        useYn: 'Y'
      },
      include: {
        store: true, // 매장 정보 포함
        _count: {
          select: { students: true }
        },
        students: {
          where: {
            measurement: {
              is: {
                status: 'measured'
              }
            }
          },
          select: {
            id: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const result = schools.map(school => ({
      id: school.id,
      seq: school.seq,
      yearMonth: school.yearMonth,
      schoolName: school.schoolName,
      userId: school.userId,
      storeId: school.storeId,
      storeName: school.store?.name || '미배정', // 매장명 추가
      useYn: school.useYn,
      status: school.status,
      createdAt: school.createdAt,
      studentCount: school._count.students,
      measuredCount: school.students.length
    }));

    return NextResponse.json(result);

  } catch (error) {
    console.error("Schools API Error:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log('Received body:', body);
    
    // 필수 필드 검증
    if (!body.yearMonth || !body.schoolName || !body.storeId) {
      return NextResponse.json(
        { error: "필수 입력값(년월, 학교명, 매장선택)이 누락되었습니다." },
        { status: 400 }
      );
    }

    // seq 자동 생성 로직 (생략 - 기존 로직 유지)
    // ...
    const lastSchool = await prisma.schools.findFirst({
      where: { yearMonth: body.yearMonth },
      orderBy: { seq: 'desc' },
    });

    let nextSeq = body.yearMonth + '00001';
    if (lastSchool) {
      const lastSeqNum = parseInt(lastSchool.seq.slice(-5));
      nextSeq = body.yearMonth + String(lastSeqNum + 1).padStart(5, '0');
    }

    const school = await prisma.schools.create({
      data: {
        seq: nextSeq,
        yearMonth: body.yearMonth,
        schoolName: body.schoolName,
        userId: parseInt(session.user.id),
        storeId: parseInt(body.storeId), // 매장 ID 연결
        useYn: 'Y'
      }
    });

    return NextResponse.json({ success: true, data: school });

  } catch (error) {
    console.error("Schools API Error:", error);
    return NextResponse.json(
      { error: "학교 등록에 실패했습니다." },
      { status: 500 }
    );
  }
}