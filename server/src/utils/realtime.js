import prisma from '../config/prisma.js'

export const emitDepartmentStats = async (io, departmentId) => {
  if (!io || !departmentId) return
  try {
    const [totalIssues, resolvedIssues, pendingIssues, avg] = await Promise.all([
      prisma.issue.count({ where: { departmentId } }),
      prisma.issue.count({ where: { departmentId, status: 'RESOLVED' } }),
      prisma.issue.count({ where: { departmentId, status: { in: ['PENDING','TRIAGED','ASSIGNED_TO_STAFF','IN_PROGRESS'] } } }),
      prisma.issue.aggregate({ where: { departmentId, status: 'RESOLVED', resolutionTimeHours: { not: null } }, _avg: { resolutionTimeHours: true } })
    ])
    const payload = {
      departmentId,
      stats: {
        totalIssues,
        resolvedIssues,
        pendingIssues,
        avgResolutionTime: Math.round((avg._avg.resolutionTimeHours || 0) * 10) / 10
      },
      timestamp: new Date().toISOString()
    }
    // Emit to department room and general admin room
    io.to(`department:${departmentId}`).emit('department:stats', payload)
    io.to('admin').emit('department:stats', payload)
  } catch (err) {
    console.warn('emitDepartmentStats failed:', err?.message)
  }
}
