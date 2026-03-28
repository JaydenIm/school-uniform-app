import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit');
    const take = limit ? parseInt(limit) : undefined;

    const boards = await prisma.board.findMany({
      take: take,
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(boards);
  } catch (error) {
    return NextResponse.json(
      { message: "게시글을 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: "공지사항 작성 권한이 없습니다." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, content } = body;

    if (!title || !content) {
      return NextResponse.json(
        { message: "제목과 내용을 입력해주세요." },
        { status: 400 }
      );
    }

    const newBoard = await prisma.board.create({
      data: {
        title,
        content,
      }
    });

    return NextResponse.json(newBoard);
  } catch (error) {
    console.error('Board creation error:', error);
    return NextResponse.json(
      { message: "게시글 작성에 실패했습니다." },
      { status: 500 }
    );
  }
}