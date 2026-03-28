import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import crypto from 'crypto';

function generatePartnerCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'OFT-';
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, phoneNumber, partnerCode } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "이름, 이메일, 비밀번호는 필수입니다." },
        { status: 400 }
      );
    }

    // 이메일 중복 체크
    const existingUser = await prisma.users.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "이미 가입된 이메일입니다." },
        { status: 400 }
      );
    }

    let parentUserId = null;
    let role = "PARTNER";
    let staffStatus = null;
    let newPartnerCodeStr = generatePartnerCode();

    // 파트너 코드(직원 연동)가 입력된 경우
    if (partnerCode) {
      const parentPartner = await prisma.users.findUnique({
        where: { partnerCode: partnerCode.toUpperCase() }
      });

      if (!parentPartner) {
        return NextResponse.json(
          { message: "유효하지 않은 파트너 코드입니다. 다시 확인해주세요." },
          { status: 400 }
        );
      }

      // 부모 파트너 발견시 'STAFF'로 변경하고 상태를 'pending'으로 설정
      parentUserId = parentPartner.id;
      role = "STAFF";
      staffStatus = "pending";
      newPartnerCodeStr = ''; // STAFF는 별도의 자신의 초대 코드를 생성하지 않음
    }

    // 만약 중복된 파트너 코드가 희박하게 발생한다면 루프 재시도 (간편하게 처리)
    let finalPartnerCode = newPartnerCodeStr;
    if (role === 'PARTNER') {
      let isUnique = false;
      while (!isUnique) {
        const check = await prisma.users.findUnique({ where: { partnerCode: finalPartnerCode } });
        if (!check) {
          isUnique = true;
        } else {
          finalPartnerCode = generatePartnerCode();
        }
      }
    } else {
      finalPartnerCode = null as any; // STAFF는 발급 안 함 (또는 Prisma 에선 그냥 안 넘김)
    }

    // Users 레코드 생성
    const newUser = await prisma.users.create({
      data: {
        loginId: email, // 이메일을 로그인 아이디로 통일
        email,
        password, // 실제로는 bcrypt 등으로 해싱하는 것이 좋음 (현재 시스템 스펙에 맞춤)
        name,
        phoneNumber: phoneNumber || null,
        role: role as any,
        partnerCode: role === 'PARTNER' ? finalPartnerCode : null,
        parentUserId,
        staffStatus,
        useYn: 'Y'
      }
    });

    // 응답 시 민감정보 제거
    const { password: _, ...userWithoutPassword } = newUser;

    return NextResponse.json(userWithoutPassword, { status: 201 });

  } catch (error: any) {
    console.error("Signup Error:", error);
    return NextResponse.json(
      { message: "회원가입 처리 중 오류가 발생했습니다.", details: error.message },
      { status: 500 }
    );
  }
}
