import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !['PARTNER', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { error: "권한이 없습니다." },
        { status: 403 }
      );
    }

    const isAdmin = session.user.role === 'ADMIN';
    const parentUserId = parseInt(session.user.id);
    const whereClause = isAdmin ? { role: "STAFF" } : { parentUserId, role: "STAFF" };

    const staffMembers = await prisma.users.findMany({
      where: whereClause as any,
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        staffStatus: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(staffMembers);
  } catch (error) {
    console.error("Staff GET API Error:", error);
    return NextResponse.json(
      { error: "직원 목록을 가져오는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !['PARTNER', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { error: "권한이 없습니다." },
        { status: 403 }
      );
    }

    const { staffId, action } = await request.json(); // action: "approve" | "resign"
    
    if (!staffId || !['approve', 'resign'].includes(action)) {
      return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
    }

    const isAdmin = session.user.role === 'ADMIN';
    const parentUserId = parseInt(session.user.id);
    
    // 보안: 해당 파트너 소속의 직원이 맞는지 확인 (ADMIN은 전부 가능)
    const staff = await prisma.users.findFirst({
      where: isAdmin ? {
        id: parseInt(staffId),
        role: "STAFF"
      } : {
        id: parseInt(staffId),
        parentUserId,
        role: "STAFF"
      }
    });

    if (!staff) {
      return NextResponse.json({ error: "대상 직원을 찾을 수 없습니다." }, { status: 404 });
    }

    const newStatus = action === 'approve' ? 'active' : 'resigned';
    
    await prisma.users.update({
      where: { id: staff.id },
      data: { staffStatus: newStatus }
    });

    return NextResponse.json({ success: true, status: newStatus });
  } catch (error) {
    console.error("Staff PATCH API Error:", error);
    return NextResponse.json(
      { error: "상태 변경 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
