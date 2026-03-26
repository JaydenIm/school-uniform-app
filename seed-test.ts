import { prisma } from './src/lib/db'

async function main() {
  try {
    const user = await prisma.users.upsert({
      where: { email: 'admin@onfit.com' },
      update: {},
      create: {
        loginId: 'admin',
        password: 'password123',
        name: 'OnFit Admin',
        email: 'admin@onfit.com',
        useYn: 'Y'
      }
    })

    // 2. 매장(Stores) 생성
    const defaultStore = await prisma.stores.upsert({
      where: { id: 1 },
      update: {},
      create: {
        id: 1,
        name: '온핏 본점',
        roadAddress: '서울특별시 강남구 테헤란로 123',
        detailAddress: '온핏빌딩 5층',
        phoneNumber: '02-1234-5678',
        userId: user.id,
      }
    })

    const secondStore = await prisma.stores.upsert({
      where: { id: 2 },
      update: {},
      create: {
        id: 2,
        name: '온핏 청담점',
        roadAddress: '서울특별시 강남구 학동로 456',
        detailAddress: '청담스퀘어 2층',
        phoneNumber: '02-9876-5432',
        userId: user.id,
      }
    })

    console.log('Stores created:', [defaultStore.name, secondStore.name])

    // 3. 학교 생성 (매장 연동)
    let school = await prisma.schools.upsert({
      where: { id: 1 },
      update: {
        storeId: defaultStore.id,
        status: 'active'
      },
      create: {
        id: 1,
        seq: '20260300001',
        yearMonth: '202603',
        schoolName: '온핏중학교',
        userId: user.id,
        storeId: defaultStore.id,
        useYn: 'Y',
        status: 'active'
      }
    })

    // 4. 학생 생성 (토큰 및 성별 포함)
    const testToken = '644b664f-f02e-49a3-bd09-aa3723e55d7b'
    let student = await prisma.students.upsert({
      where: { token: testToken },
      update: {
        gender: '남'
      },
      create: {
        name: '테스트학생',
        grade: '1',
        class: '1',
        birthDate: '20100101',
        phoneNumber: '010-0000-0000',
        gender: '남',
        schoolId: school.id,
        token: testToken,
        useYn: 'Y'
      }
    })

    console.log('--- Seeded successfully ---')
    console.log('Admin User:', user.loginId)
    console.log('Main Store:', defaultStore.name)
    console.log('School:', school.schoolName)
    console.log('Student:', student.name)
    console.log('Test Measurement Link: http://localhost:3000/measure/' + student.token)
  } catch (err: any) {
    console.error('SEED ERROR:', err.message)
  }
}

main()
  .catch(e => console.error('MAIN CATCH:', e))
  .finally(async () => await prisma.$disconnect())
