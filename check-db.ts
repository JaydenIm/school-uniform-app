import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.users.findMany();
  console.log('Users in DB:', users);
  
  const schools = await prisma.schools.findMany();
  console.log('Schools in DB:', schools);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
