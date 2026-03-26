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
    const user = await prisma.users.findUnique({
      where: { email: session.user.email },
      select: { id: true, name: true, email: true, phoneNumber: true, image: true }
    });
    return NextResponse.json(user);
  } catch (err) {
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