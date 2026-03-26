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
    if (!body.yearMonth || !body.schoolName) {
      return NextResponse.json(
        { error: "필수 입력값이 누락되었습니다." },
        { status: 400 }
      );
    }

    // seq 자동 생성 로직
    const lastSchool = await prisma.schools.findFirst({
      where: {
        yearMonth: body.yearMonth,
      },
      orderBy: {
        seq: 'desc',
      },
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
        address: body.address || null,
        managerContact: body.managerContact || null,
        userId: parseInt(session.user.id),
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