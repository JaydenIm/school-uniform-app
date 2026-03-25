import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.users.findMany();
  const schools = await prisma.schools.findMany();
  const students = await prisma.students.findMany();
  const sales = await prisma.sales.findMany();
  const revenues = await prisma.revenue.findMany();
  const boards = await prisma.board.findMany();

  const seedData = {
    users,
    schools,
    students,
    sales,
    revenues,
    boards,
  };

  fs.writeFileSync('extracted-data.json', JSON.stringify(seedData, null, 2));
  console.log('Data exported to extracted-data.json');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
