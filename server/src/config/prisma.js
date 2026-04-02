import pkg from '@prisma/client'
const { PrismaClient } = pkg

// Optimized Prisma configuration
const prismaOptions = {
  log: process.env.NODE_ENV === 'production' 
    ? ['error'] // Only log errors in production
    : ['warn', 'error'], // Log warnings and errors in development
  
  // Connection pool optimization
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
}

let prisma

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient(prismaOptions)
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient(prismaOptions)
  }
  prisma = global.prisma
}

// Graceful disconnect on process termination
process.on('beforeExit', async () => {
  await prisma.$disconnect()
})

export default prisma
