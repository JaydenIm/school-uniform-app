import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.users.findUnique({ where: { email: 'admin@onfit.com' } });
  
  if (!admin) {
    console.log('Admin not found');
    return;
  }

  const staffs = [
    {
      name: '테스트 직원1',
      email: 'staff1@onfit.com',
      password: 'password', // 실제로는 해싱해야 함
      role: 'STAFF',
      staffStatus: 'pending',
      parentUserId: admin.id,
      loginId: 'staff1',
      useYn: 'Y'
    },
    {
      name: '테스트 직원2',
      email: 'staff2@onfit.com',
      password: 'password',
      role: 'STAFF',
      staffStatus: 'active',
      parentUserId: admin.id,
      loginId: 'staff2',
      useYn: 'Y'
    },
    {
      name: '테스트 직원3',
      email: 'staff3@onfit.com',
      password: 'password',
      role: 'STAFF',
      staffStatus: 'resigned',
      parentUserId: admin.id,
      loginId: 'staff3',
      useYn: 'Y'
    }
  ];

  for (const staff of staffs) {
    let _staff: any = staff;
    await prisma.users.upsert({
      where: { email: staff.email },
      update: _staff,
      create: _staff
    });
  }
  
  console.log('Inserted 3 test staff members for admin');
}

main().catch(console.error).finally(() => prisma.$disconnect());
