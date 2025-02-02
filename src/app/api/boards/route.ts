import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // 최근 5개의 게시글만 가져오기
    const boards = await prisma.board.findMany({
      take: 5,
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