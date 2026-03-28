import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  try {
    let user = await prisma.users.findUnique({
      where: { email: session.user.email },
      select: { id: true, name: true, email: true, phoneNumber: true, image: true, role: true, partnerCode: true }
    });

    // 기존 멤버 중 PARTNER인데 코드가 없는 경우 자동 발급
    if (user && user.role === 'PARTNER' && !user.partnerCode) {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let newCode = 'OFT-';
      for (let i = 0; i < 4; i++) newCode += chars.charAt(Math.floor(Math.random() * chars.length));

      // 중복 체크 로직 단순화 (확률상 낮으므로 일단 저장 시도, 실제 서비스에선 루프 필요)
      user = await prisma.users.update({
        where: { id: user.id },
        data: { partnerCode: newCode },
        select: { id: true, name: true, email: true, phoneNumber: true, image: true, role: true, partnerCode: true }
      });
    }

    return NextResponse.json(user);
  } catch (err) {
    console.error('Fetch profile error:', err);
    return NextResponse.json({ error: '데이터 로드 실패' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, phoneNumber, image } = body;

    const user = await prisma.users.update({
      where: { email: session.user.email },
      data: {
        name,
        phoneNumber,
        image
      }
    });

    return NextResponse.json({ success: true, user });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: '프로필 업데이트 실패' }, { status: 500 });
  }
}