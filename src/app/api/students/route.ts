import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: Request) {
    if (request.method !== 'POST') {
      return NextResponse.json({ message: 'Method not allowed' }, { status: 405 })
    }
  
    try {
      const { schoolId, students } = await request.json()
      
      // 디버깅을 위한 로그
      console.log('Received data:', { schoolId, students })
  
      if (!schoolId || !students || !Array.isArray(students)) {
        return NextResponse.json({ 
          message: '잘못된 데이터 형식입니다.' 
        }, { status: 400 })
      }
  
      // birthDate 형식 변환 함수
      const formatDate = (dateStr: string) => {
        const year = dateStr.substring(0, 4)
        const month = dateStr.substring(4, 6)
        const day = dateStr.substring(6, 8)
        return new Date(`${year}-${month}-${day}`)
      }
  
      // 학생 데이터 일괄 생성
      const createdStudents = await prisma.students.createMany({
        data: students.map((student: any) => ({
          name: student.studentName,
          birthDate: student.birthDate.toString(),  // Date를 string으로 변환
          phoneNumber: student.phoneNumber || null,
          gender: student.gender || null,
          schoolId: parseInt(schoolId),
          useYn: 'Y'
        }))
      })
  
      console.log('Created students:', createdStudents) // 디버깅용
      return NextResponse.json(createdStudents, { status: 201 })
    } catch (error: any) {
      console.error('Students creation error:', error)
      return NextResponse.json({ 
        message: '학생 등록 중 오류가 발생했습니다.' 
      }, { status: 500 })
    }
  } 