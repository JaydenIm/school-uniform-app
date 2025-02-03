import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

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
      select: {
        id: true,
        seq: true,
        yearMonth: true,
        schoolName: true,
        userId: true,
        useYn: true,
        createdAt: true,
      },
      where: {
        useYn: 'Y'
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(schools);

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
    console.log('Received body:', body);  // 디버깅용 로그 추가
    
    // 필수 필드 검증
    if (!body.seq || !body.yearMonth || !body.schoolName) {
      console.log('Missing required fields:', { 
        seq: body.seq, 
        yearMonth: body.yearMonth, 
        schoolName: body.schoolName 
      });  // 디버깅용 로그 추가
      return NextResponse.json(
        { error: "필수 입력값이 누락되었습니다." },
        { status: 400 }
      );
    }

    const school = await prisma.schools.create({
      data: {
        seq: body.seq,
        yearMonth: body.yearMonth,
        schoolName: body.schoolName,
        userId: parseInt(session.user.id),
        useYn: 'Y'
      }
    });

    return NextResponse.json(school);

  } catch (error) {
    console.error("Schools API Error:", error);
    return NextResponse.json(
      { error: "학교 등록에 실패했습니다." },
      { status: 500 }
    );
  }
}