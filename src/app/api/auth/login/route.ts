import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { loginId, password } = await request.json();

    if (!loginId || !password) {
      return NextResponse.json(
        { message: '아이디와 비밀번호를 입력해주세요.' },
        { status: 400 }
      );
    }

    const user = await prisma.users.findUnique({
      where: { 
        loginId: loginId 
      },
      select: {
        id: true,
        name: true,
        email: true,
        password: true
      }
    });

    if (!user || user.password !== password) {
      return NextResponse.json(
        { message: '아이디 또는 비밀번호가 일치하지 않습니다.' },
        { status: 401 }
      );
    }

    // 비밀번호는 응답에서 제외
    const { password: _, ...userWithoutPassword } = user;

    // 응답에 쿠키 설정
    const response = NextResponse.json({
      success: true,
      message: '로그인 성공',
      user: userWithoutPassword
    });

    // 쿠키 설정
    response.cookies.set('user', JSON.stringify(userWithoutPassword), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}