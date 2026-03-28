import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: "권한이 없습니다." },
        { status: 403 }
      );
    }

    const partners = await prisma.users.findMany({
      where: {
        role: 'PARTNER',
        useYn: 'Y'
      },
      include: {
        stores: {
          where: {
            useYn: 'Y'
          },
          select: {
            id: true,
            name: true,
            roadAddress: true,
            detailAddress: true
          }
        },
        schools: {
          select: {
            id: true,
            schoolName: true,
            yearMonth: true,
            status: true,
            _count: {
              select: { students: true }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(partners);

  } catch (error) {
    console.error("Partners API Error:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
