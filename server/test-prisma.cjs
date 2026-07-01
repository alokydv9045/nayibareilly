const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const startOfDay = new Date();
    const r = await prisma.issue.count({
      where: {
        moderatorId: 'test',
        moderationStatus: { in: ['APPROVED', 'REJECTED'] }
      }
    });
    console.log('Prisma success:', r);
  } catch(e) {
    console.error('Prisma Error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

check();
