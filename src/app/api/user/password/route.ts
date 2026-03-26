import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { currentPassword, newPassword } = body;

    const user = await prisma.users.findUnique({
      where: { email: session.user.email }
    });

    if (!user || user.password !== currentPassword) {
      return NextResponse.json({ error: '현재 비밀번호가 일치하지 않습니다.' }, { status: 400 });
    }

    await prisma.users.update({
      where: { email: session.user.email },
      data: { password: newPassword }
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: '비밀번호 변경 실패' }, { status: 500 });
  }
}
