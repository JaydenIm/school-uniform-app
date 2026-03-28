import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const { id } = params;
    const userId = parseInt(session.user.id);

    // 본인 키워드인지 확인
    const keyword = await prisma.searchKeywords.findUnique({
      where: { id: parseInt(id) }
    });

    if (!keyword || keyword.userId !== userId) {
      return NextResponse.json({ error: "권한이 없거나 존재하지 않는 키워드입니다." }, { status: 403 });
    }

    // 물리 삭제 대신 논리 삭제 (useYn = 'N')
    await prisma.searchKeywords.update({
      where: { id: parseInt(id) },
      data: { useYn: 'N' }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Keyword delete error:", error);
    return NextResponse.json({ error: "키워드를 삭제하는 중 오류가 발생했습니다." }, { status: 500 });
  }
}
