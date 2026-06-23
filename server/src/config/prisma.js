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

const basePrisma = process.env.NODE_ENV === 'production'
  ? new PrismaClient(prismaOptions)
  : (global.prisma || (global.prisma = new PrismaClient(prismaOptions)))

// Graceful disconnect on process termination
process.on('beforeExit', async () => {
  await basePrisma.$disconnect()
})

const prisma = basePrisma.$extends({
  query: {
    activityLog: {
      async create({ args, query }) {
        const result = await query(args)
        try {
          const { getIO } = await import('./socket.js')
          const io = getIO()
          if (io) {
            let email = 'System'
            let roles = ['SYSTEM']
            if (result.userId) {
              const user = await basePrisma.user.findUnique({
                where: { id: result.userId },
                select: { email: true, roles: true }
              })
              if (user) {
                email = user.email
                roles = user.roles
              }
            }
            
            let level = 'INFO'
            let source = 'system-service'
            const actionStr = String(result.action).toUpperCase()
            if (actionStr.includes('FAIL') || actionStr.includes('BLOCK') || actionStr.includes('LOCK') || actionStr.includes('DENY')) {
              level = 'WARN'
            } else if (actionStr.includes('ERROR') || (actionStr.includes('FAIL') && actionStr.includes('CRITICAL'))) {
              level = 'ERROR'
            }
            
            if (actionStr.includes('LOGIN') || actionStr.includes('LOGOUT') || actionStr.includes('REGISTER') || actionStr.includes('AUTH') || actionStr.includes('PASSWORD') || actionStr.includes('OTP')) {
              source = 'auth-service'
            } else if (result.issueId) {
              source = 'issue-service'
            } else if (actionStr.includes('ASSIGN') || actionStr.includes('DEPARTMENT')) {
              source = 'department-service'
            } else if (actionStr.includes('AUDIT') || actionStr.includes('TECH_ADMIN') || actionStr.includes('ADMIN')) {
              source = 'techadmin'
            }

            const payload = {
              id: result.id,
              timestamp: result.createdAt || new Date().toISOString(),
              userId: result.userId || 'system',
              userEmail: email,
              userRole: roles[0] || 'SYSTEM',
              action: result.action || 'ACTIVITY',
              resource: result.issueId ? 'Issue' : 'System',
              details: result.description,
              ipAddress: result.ipAddress || '127.0.0.1',
              userAgent: result.userAgent || 'Unknown',
              outcome: 'SUCCESS',
              severity: level === 'ERROR' ? 'HIGH' : level === 'WARN' ? 'MEDIUM' : 'LOW',
              level,
              source,
              message: result.description
            }
            
            io.emit('activity:log', payload)
          }
        } catch (err) {
          console.warn('[Prisma Extension] Failed to broadcast activity log:', err.message)
        }
        return result
      }
    }
  }
})

export default prisma;

