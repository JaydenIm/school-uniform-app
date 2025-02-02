const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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
  
  const sampleBoards = [
    { title: '공지사항: 시스템 업데이트 안내', content: '시스템 업데이트 내용...' },
    { title: '새로운 기능 추가 안내', content: '새로운 기능 소개...' },
    { title: '2024년 1분기 계획', content: '1분기 계획 내용...' },
    { title: '사용자 매뉴얼 업데이트', content: '매뉴얼 업데이트 내용...' },
    { title: '긴급 공지: 서버 점검 안내', content: '서버 점검 내용...' },
    { title: '신규 사용자 가이드', content: '가이드 내용...' },
    { title: '업데이트 로그 v1.2.0', content: '업데이트 내용...' },
    { title: '자주 묻는 질문 모음', content: 'FAQ 내용...' },
    { title: '시스템 사용 팁 공유', content: '사용 팁 내용...' },
    { title: '연말 정비 계획 안내', content: '정비 계획 내용...' },
  ];

  for (const board of sampleBoards) {
    await prisma.board.create({
      data: {
        ...board,
        authorId: 1, // 관리자 ID
      },
    });
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 