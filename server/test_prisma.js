import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function test() {
  try {
    const activities = await prisma.activityLog.findMany({
      where: { userId: null },
      orderBy: { createdAt: 'desc' },
      take: 2
    });
    console.log("System activity:", activities);
  } catch (err) {
    console.error("Error in getSystemActivity:", err);
  }

  try {
    const events = await prisma.activityLog.findMany({
      where: {
        action: { in: ['LOGIN', 'FAILED_LOGIN', 'PASSWORD_CHANGED', 'PERMISSION_CHANGED'] }
      },
      orderBy: { createdAt: 'desc' },
      take: 2,
      include: { user: { select: { email: true } } }
    });
    console.log("Security events:", events);
  } catch (err) {
    console.error("Error in getSecurityEvents:", err);
  }
}

test().finally(() => prisma.$disconnect());
