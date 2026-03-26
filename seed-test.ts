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

    let school = await prisma.schools.findFirst({
      where: { schoolName: '온핏중학교' }
    })
    if (!school) {
      school = await prisma.schools.create({
        data: {
          seq: '20260300001',
          yearMonth: '202603',
          schoolName: '온핏중학교',
          userId: user.id,
          useYn: 'Y'
        }
      })
    }

    const student = await prisma.students.create({
      data: {
        name: '테스트학생',
        grade: '1',
        class: '1',
        birthDate: '20100101',
        phoneNumber: '010-0000-0000',
        schoolId: school.id,
        useYn: 'Y'
      }
    })

    console.log('--- Seeded successfully ---')
    console.log('Admin User:', user.loginId)
    console.log('School:', school.schoolName)
    console.log('Student:', student.name)
    console.log('Student Token:', student.token)
    console.log('Test Measurement Link: http://localhost:3000/measure/' + student.token)
  } catch (err: any) {
    console.error('SEED ERROR:', err.message)
  }
}

main()
  .catch(e => console.error('MAIN CATCH:', e))
  .finally(async () => await prisma.$disconnect())
