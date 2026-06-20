import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const users = await prisma.user.findMany({
    where: {
      verifyToken: { not: null }
    },
    select: {
      phone: true,
      verifyToken: true,
      verifyTokenExp: true
    }
  })
  console.log(users)
}

main().catch(console.error).finally(() => prisma.$disconnect())
