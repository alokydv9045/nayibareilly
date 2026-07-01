import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres.rqshpefnbpgtztemwwfj:LCQgI6wQGMiYSAIW@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
    }
  }
})

async function main() {
  try {
    console.log('Testing Prisma connection...')
    const count = await prisma.user.count()
    console.log('User count:', count)
    
    console.log('Testing issue count...')
    const issueCount = await prisma.issue.count()
    console.log('Issue count:', issueCount)
    
    console.log('All tests passed.')
  } catch (error) {
    console.error('Prisma Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
