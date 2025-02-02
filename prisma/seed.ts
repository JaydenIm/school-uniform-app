import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const testUser = await prisma.users.create({
    data: {
      loginId: 'uniform_admin',
      password: '1234',
      name: '교복관리자',
      email: 'test@test.com',
    },
  })
  console.log('Created test user:', testUser)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 