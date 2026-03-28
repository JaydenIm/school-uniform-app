import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const board = await prisma.board.findUnique({
      where: { id }
    });

    if (!board) {
      return NextResponse.json(
        { message: "게시글을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    return NextResponse.json(board);
  } catch (error) {
    return NextResponse.json(
      { message: "게시글을 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}
