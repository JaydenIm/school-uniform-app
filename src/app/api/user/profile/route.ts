import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    

    if (!session?.user) {
      return NextResponse.json(
        { message: "인증되지 않은 요청입니다." },
        { status: 401 }
      );
    }

    const data = await request.json();
    const { name, phoneNumber, currentPassword, newPassword } = data;

    // 기본 업데이트 데이터
    const updateData: any = {
      name,
      phoneNumber,
    };

    // 비밀번호 변경이 요청된 경우
    if (currentPassword && newPassword) {
      // 현재 사용자 정보 조회
      const user = await prisma.users.findUnique({
        where: { id: Number(session.user.id) },
      });

      if (!user) {
        return NextResponse.json(
          { message: "사용자를 찾을 수 없습니다." },
          { status: 404 }
        );
      }

      // 현재 비밀번호 확인
      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        user.password
      );

      if (!isPasswordValid) {
        return NextResponse.json(
          { message: "현재 비밀번호가 일치하지 않습니다." },
          { status: 400 }
        );
      }

      // 새 비밀번호 해시
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      updateData.password = hashedPassword;
    }

    // 프로필 업데이트
    const updatedUser = await prisma.users.update({
      where: { id: Number(session.user.id) },
      data: updateData,
    });

    return NextResponse.json({
      message: "프로필이 성공적으로 업데이트되었습니다.",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phoneNumber: updatedUser.phoneNumber,
      },
    });

  } catch (error: any) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { message: "프로필 업데이트 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
} 