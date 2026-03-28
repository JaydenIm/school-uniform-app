import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const keywords = await prisma.searchKeywords.findMany({
      where: {
        userId,
        useYn: 'Y'
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(keywords);
  } catch (error) {
    console.error("Keywords fetch error:", error);
    return NextResponse.json({ error: "데이터를 불러오는 중 오류가 발생했습니다." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const { keyword } = await request.json();
    if (!keyword || keyword.trim() === '') {
      return NextResponse.json({ error: "키워드를 입력해주세요." }, { status: 400 });
    }

    const userId = parseInt(session.user.id);
    
    // 중복 체크 (사용자별)
    const existing = await prisma.searchKeywords.findFirst({
      where: {
        userId,
        keyword: keyword.trim(),
        useYn: 'Y'
      }
    });

    if (existing) {
      return NextResponse.json({ error: "이미 등록된 키워드입니다." }, { status: 400 });
    }

    const newKeyword = await prisma.searchKeywords.create({
      data: {
        keyword: keyword.trim(),
        userId
      }
    });

    return NextResponse.json(newKeyword);
  } catch (error) {
    console.error("Keyword creation error:", error);
    return NextResponse.json({ error: "키워드 등록 중 오류가 발생했습니다." }, { status: 500 });
  }
}
