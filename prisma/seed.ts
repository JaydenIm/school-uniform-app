import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function main() {
  const data = JSON.parse(fs.readFileSync('./prisma/seed-data.json', 'utf8'));

  console.log('Seeding data...');

  // 1. Users
  for (const user of data.users) {
    await prisma.users.upsert({
      where: { id: user.id },
      update: user,
      create: user,
    });
  }
  console.log('Users seeded.');

  // 2. Schools
  for (const school of data.schools) {
    await prisma.schools.upsert({
      where: { id: school.id },
      update: school,
      create: school,
    });
  }
  console.log('Schools seeded.');

  // 3. Students
  for (const student of data.students) {
    await prisma.students.upsert({
      where: { id: student.id },
      update: student,
      create: student,
    });
  }
  console.log('Students seeded.');

  // 4. Sales
  for (const sale of data.sales) {
    await prisma.sales.upsert({
      where: { id: sale.id },
      update: sale,
      create: sale,
    });
  }
  console.log('Sales seeded.');

  // 5. Revenues
  for (const revenue of data.revenues) {
    await prisma.revenue.upsert({
      where: { id: revenue.id },
      update: revenue,
      create: revenue,
    });
  }
  console.log('Revenues seeded.');

  // 6. Boards
  for (const board of data.boards) {
    await prisma.board.upsert({
      where: { id: board.id },
      update: board,
      create: board,
    });
  }
  console.log('Boards seeded.');

  console.log('Seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });