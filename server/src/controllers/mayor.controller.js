import prisma from '../config/prisma.js'
import { ok, fail } from '../utils/apiResponse.js'

const IN_PROGRESS_STATUSES = [
  'PENDING',
  'PENDING_MODERATOR_REVIEW',
  'APPROVED_BY_MODERATOR',
  'ASSIGNED_TO_DEPARTMENT',
  'ACCEPTED_BY_DEPARTMENT',
  'TRIAGED',
  'ASSIGNED_TO_STAFF',
  'STAFF_EN_ROUTE',
  'STAFF_ON_SITE',
  'IN_PROGRESS',
  'WORK_COMPLETED',
  'PENDING_CITIZEN_VERIFICATION',
]

export const getStats = async (_req, res) => {
  try {
    const [totalIssues, resolvedIssues, inProgress, avg, overdueIssues, activeStaff, avgRating] = await Promise.all([
      prisma.issue.count(),
      prisma.issue.count({ where: { status: 'RESOLVED' } }),
      prisma.issue.count({ where: { status: { in: IN_PROGRESS_STATUSES } } }),
      prisma.issue.aggregate({
        where: { status: 'RESOLVED', resolutionTimeHours: { not: null } },
        _avg: { resolutionTimeHours: true }
      }),
      prisma.issue.count({ where: { slaBreached: true, status: { not: 'RESOLVED' } } }),
      prisma.user.count({ where: { isActive: true, roles: { has: 'staff' } } }),
      prisma.issue.aggregate({
        where: { status: 'RESOLVED', citizenRating: { not: null } },
        _avg: { citizenRating: true }
      })
    ])

    const total = Math.max(totalIssues, 1)
    const resolvedRate = (resolvedIssues / total) * 100
    const slaBreachedOpen = overdueIssues
    // Simple city health score heuristic
    let cityHealthScore = Math.round(
      Math.min(100, Math.max(0, 60 + (resolvedRate * 0.4) - (slaBreachedOpen * 0.1)))
    )

    const citizenSatisfaction = Math.round(((avgRating._avg.citizenRating || 4) / 5) * 100)

    return ok(res, {
      totalIssues,
      resolvedIssues,
      inProgress,
      averageResolutionTime: Math.round((avg._avg.resolutionTimeHours || 0) * 10) / 10,
      citizenSatisfaction,
      totalReports: totalIssues,
      cityHealthScore,
      overdueIssues,
      activeStaff
    })
  } catch (error) {
    console.error('Mayor stats error:', error)
    return fail(res, 500, 'Failed to load mayor stats')
  }
}

export const getDepartmentPerformance = async (_req, res) => {
  try {
    // Get active departments
    const departments = await prisma.department.findMany({
      where: { isActive: true },
      select: { id: true, name: true }
    })

    const items = await Promise.all(departments.map(async (d) => {
      const [assigned, resolved, inProg, avgTime, resolvedWithinSLA] = await Promise.all([
        prisma.issue.count({ where: { departmentId: d.id } }),
        prisma.issue.count({ where: { departmentId: d.id, status: 'RESOLVED' } }),
        prisma.issue.count({ where: { departmentId: d.id, status: { in: IN_PROGRESS_STATUSES } } }),
        prisma.issue.aggregate({
          where: { departmentId: d.id, status: 'RESOLVED', resolutionTimeHours: { not: null } },
          _avg: { resolutionTimeHours: true }
        }),
        prisma.issue.count({ where: { departmentId: d.id, status: 'RESOLVED', slaBreached: false } })
      ])

      const issuesAssigned = assigned
      const resolvedRate = issuesAssigned ? (resolved / issuesAssigned) * 100 : 0
      const slaCompliance = resolved ? Math.round((resolvedWithinSLA / resolved) * 100) : 0
      const performance = Math.round((resolvedRate * 0.7) + (slaCompliance * 0.3))

      return {
        name: d.name,
        issuesAssigned,
        resolved,
        inProgress: inProg,
        performance,
        avgTime: Math.round((avgTime._avg.resolutionTimeHours || 0) * 10) / 10,
        slaCompliance
      }
    }))

    // Sort by performance desc, then name
    items.sort((a, b) => b.performance - a.performance || a.name.localeCompare(b.name))

    return ok(res, items)
  } catch (error) {
    console.error('Mayor dept performance error:', error)
    return fail(res, 500, 'Failed to load department performance')
  }
}

export const getRecentIssues = async (_req, res) => {
  try {
    const issues = await prisma.issue.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        reportId: true,
        title: true,
        description: true,
        status: true,
        totalVotes: true,
        citizenRating: true,
        resolutionTimeHours: true,
        createdAt: true,
        acceptedByDeptAt: true,
        timeline: {
          orderBy: { createdAt: 'asc' },
          select: { status: true, note: true, createdAt: true, performedBy: { select: { name: true, email: true } } }
        }
      }
    })

    const toHumanTime = (hours) => {
      if (!hours && hours !== 0) return '—'
      if (hours < 1) return `${Math.round(hours * 60)} min`
      return `${Math.round(hours * 10) / 10} hours`
    }

    const recent = issues.map((i) => {
      const responseMinutes = i.acceptedByDeptAt ? Math.max(1, Math.round((i.acceptedByDeptAt - i.createdAt) / (1000 * 60))) : 30
      const timeline = i.timeline.map((t) => ({
        stage: t.status.replaceAll('_', ' ').toLowerCase().replace(/^./, (c) => c.toUpperCase()),
        actor: t.performedBy?.name || t.performedBy?.email || 'System',
        time: new Date(t.createdAt).toLocaleString(),
        completed: true,
        notes: t.note || undefined
      }))
      return {
        reportId: i.reportId,
        title: i.title,
        description: i.description,
        status: i.status,
        timeline,
        totalTime: toHumanTime(i.resolutionTimeHours || 0),
        responseTime: `${responseMinutes} minutes`,
        citizenRating: i.citizenRating || undefined
      }
    })

    return ok(res, recent)
  } catch (error) {
    console.error('Mayor recent issues error:', error)
    return fail(res, 500, 'Failed to load recent issues')
  }
}
