import prisma from '../config/prisma.js'
import { ok, created, fail } from '../utils/apiResponse.js'

export const dashboard = async (req, res) => {
  try {
    // Get current date ranges for analytics
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // Execute dashboard queries in parallel for better performance
    const [
      totalUsers,
      totalIssues,
      resolvedIssues,
      pendingIssues,
      criticalIssues,
      escalatedIssues,
      todayIssues,
      weekIssues,
      monthIssues,
      avgResolutionTime,
      departmentStats,
      categoryStats
    ] = await Promise.all([
      // User statistics
      prisma.user.count(),
      
      // Issue statistics
      prisma.issue.count(),
      prisma.issue.count({ where: { status: 'RESOLVED' } }),
      prisma.issue.count({ where: { status: { in: ['PENDING', 'TRIAGED', 'IN_PROGRESS'] } } }),
      prisma.issue.count({ where: { priority: 'CRITICAL', status: { not: 'RESOLVED' } } }),
      prisma.issue.count({ where: { isEscalated: true, status: { not: 'RESOLVED' } } }),
      
      // Time-based statistics
      prisma.issue.count({ where: { createdAt: { gte: today } } }),
      prisma.issue.count({ where: { createdAt: { gte: thisWeek } } }),
      prisma.issue.count({ where: { createdAt: { gte: thisMonth } } }),
      
      // Average resolution time (in hours)
      prisma.issue.aggregate({
        where: { 
          status: 'RESOLVED',
          resolutionTimeHours: { not: null }
        },
        _avg: { resolutionTimeHours: true }
      }),
      
      // Department performance
      prisma.issue.groupBy({
        by: ['departmentId'],
        _count: { _all: true },
        where: { departmentId: { not: null } },
        orderBy: { _count: { _all: 'desc' } },
        take: 5
      }),
      
      // Category distribution
      prisma.issue.groupBy({
        by: ['categoryId'],
        _count: { _all: true },
        where: { categoryId: { not: null } },
        orderBy: { _count: { _all: 'desc' } },
        take: 10
      })
    ])

    // Calculate resolution rate
    const resolutionRate = totalIssues > 0 ? ((resolvedIssues / totalIssues) * 100).toFixed(1) : 0

    // Get department names for department stats
    const departmentIds = departmentStats.map(d => d.departmentId).filter(Boolean)
    const departments = departmentIds.length > 0 ? await prisma.department.findMany({
      where: { id: { in: departmentIds } },
      select: { id: true, name: true, code: true }
    }) : []

    const departmentMap = new Map(departments.map(d => [d.id, d]))
    const enrichedDepartmentStats = departmentStats.map(stat => ({
      department: departmentMap.get(stat.departmentId) || { id: stat.departmentId, name: 'Unknown', code: 'UNK' },
      count: stat._count._all
    }))

    // Get category names for category stats
    const categoryIds = categoryStats.map(c => c.categoryId).filter(Boolean)
    const categories = categoryIds.length > 0 ? await prisma.issueCategory.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true, icon: true, color: true }
    }) : []

    const categoryMap = new Map(categories.map(c => [c.id, c]))
    const enrichedCategoryStats = categoryStats.map(stat => ({
      category: categoryMap.get(stat.categoryId) || { id: stat.categoryId, name: 'Unknown', icon: 'help-circle', color: '#9CA3AF' },
      count: stat._count._all
    }))

    // Return comprehensive dashboard data
    ok(res, {
      overview: {
        totalUsers,
        totalIssues,
        resolvedIssues,
        pendingIssues,
        criticalIssues,
        escalatedIssues,
        resolutionRate: parseFloat(resolutionRate),
        avgResolutionTime: avgResolutionTime._avg.resolutionTimeHours || 0
      },
      trends: {
        today: todayIssues,
        thisWeek: weekIssues,
        thisMonth: monthIssues
      },
      departments: enrichedDepartmentStats,
      categories: enrichedCategoryStats,
      alerts: {
        critical: criticalIssues,
        escalated: escalatedIssues,
        slaBreached: await prisma.issue.count({ where: { slaBreached: true, status: { not: 'RESOLVED' } } })
      },
      lastUpdated: now.toISOString()
    })

  } catch (error) {
    console.error('Dashboard error:', error)
    return fail(res, 500, 'Failed to load dashboard data')
  }
}

export const listUsers = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      role, 
      status, 
      search,
      sort = 'newest',
      department 
    } = req.query

    // Validate pagination
    const pageNum = Math.max(1, parseInt(page, 10) || 1)
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20))

    // Build where clause
    const where = {}

    // Role filter
    if (role) {
      const validRoles = ['citizen', 'staff', 'moderator', 'dept_admin', 'mayor', 'super_admin']
      if (validRoles.includes(role)) {
        where.roles = { has: role }
      } else {
        return fail(res, 400, 'Invalid role filter')
      }
    }

    // Status filter
    if (status) {
      if (status === 'active') {
        where.isActive = true
      } else if (status === 'inactive') {
        where.isActive = false
      } else if (status === 'verified') {
        where.isVerified = true
      } else if (status === 'unverified') {
        where.isVerified = false
      } else {
        return fail(res, 400, 'Invalid status filter')
      }
    }

    // Department filter
    if (department) {
      where.departmentId = department
    }

    // Search filter
    if (search) {
      const searchTerm = String(search).trim()
      if (searchTerm.length >= 2) {
        where.OR = [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { email: { contains: searchTerm, mode: 'insensitive' } }
        ]
      }
    }

    // Sort options
    const orderBy = (() => {
      switch (sort) {
        case 'name':
          return [{ name: 'asc' }]
        case 'email':
          return [{ email: 'asc' }]
        case 'oldest':
          return [{ createdAt: 'asc' }]
        case 'lastLogin':
          return [{ lastLogin: 'desc' }]
        case 'newest':
        default:
          return [{ createdAt: 'desc' }]
      }
    })()

    // Calculate pagination
    const skip = (pageNum - 1) * limitNum

    // Execute queries
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy,
        skip,
        take: limitNum,
        select: {
          id: true,
          email: true,
          name: true,
          roles: true,
          avatarUrl: true,
          createdAt: true,
          lastLogin: true,
          isVerified: true,
          isActive: true,
          requestedRole: true,
          department: {
            select: {
              id: true,
              name: true,
              code: true
            }
          },
          _count: {
            select: {
              reportedIssues: true,
              assignedIssues: true,
              resolvedIssues: true
            }
          }
        }
      }),
      prisma.user.count({ where })
    ])

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limitNum)

    ok(res, {
      users,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      },
      filters: {
        role: role || null,
        status: status || null,
        search: search || null,
        sort,
        department: department || null
      }
    })

  } catch (error) {
    console.error('List users error:', error)
    return fail(res, 500, 'Failed to fetch users')
  }
}

export const analytics = async (req, res) => {
  try {
    const { period = '30d', departmentId, categoryId } = req.query

    // Calculate date ranges based on period
    const now = new Date()
    let startDate
    
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        break
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }

    // Build base where clause for filtering
    const baseWhere = {
      createdAt: { gte: startDate }
    }

    if (departmentId) {
      baseWhere.departmentId = departmentId
    }

    if (categoryId) {
      baseWhere.categoryId = categoryId
    }

    // Execute analytics queries in parallel
    const [
      statusDistribution,
      priorityDistribution,
      categoryDistribution,
      departmentDistribution,
      dailyTrends,
      resolutionMetrics,
      userMetrics,
      slaMetrics
    ] = await Promise.all([
      // Status distribution
      prisma.issue.groupBy({
        by: ['status'],
        _count: { _all: true },
        where: baseWhere
      }),

      // Priority distribution
      prisma.issue.groupBy({
        by: ['priority'],
        _count: { _all: true },
        where: baseWhere
      }),

      // Category distribution
      prisma.issue.groupBy({
        by: ['categoryId'],
        _count: { _all: true },
        where: { ...baseWhere, categoryId: { not: null } },
        orderBy: { _count: { _all: 'desc' } },
        take: 10
      }),

      // Department distribution
      prisma.issue.groupBy({
        by: ['departmentId'],
        _count: { _all: true },
        where: { ...baseWhere, departmentId: { not: null } },
        orderBy: { _count: { _all: 'desc' } }
      }),

      // Daily trends (last 30 days)
      prisma.$queryRaw`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as count,
          COUNT(CASE WHEN status = 'RESOLVED' THEN 1 END) as resolved_count
        FROM issues 
        WHERE created_at >= ${startDate}
        GROUP BY DATE(created_at)
        ORDER BY date DESC
        LIMIT 30
      `,

      // Resolution metrics
      prisma.issue.aggregate({
        where: { 
          ...baseWhere,
          status: 'RESOLVED',
          resolutionTimeHours: { not: null }
        },
        _avg: { resolutionTimeHours: true },
        _min: { resolutionTimeHours: true },
        _max: { resolutionTimeHours: true },
        _count: { _all: true }
      }),

      // User activity metrics
      prisma.user.count({
        where: {
          createdAt: { gte: startDate }
        }
      }),

      // SLA metrics
      prisma.issue.aggregate({
        where: baseWhere,
        _count: {
          slaBreached: true
        }
      })
    ])

    // Enrich category distribution with category names
    const categoryIds = categoryDistribution.map(c => c.categoryId).filter(Boolean)
    const categories = categoryIds.length > 0 ? await prisma.issueCategory.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true, color: true, icon: true }
    }) : []

    const categoryMap = new Map(categories.map(c => [c.id, c]))
    const enrichedCategoryStats = categoryDistribution.map(stat => ({
      category: categoryMap.get(stat.categoryId) || { 
        id: stat.categoryId, 
        name: 'Unknown', 
        color: '#9CA3AF',
        icon: 'help-circle'
      },
      count: stat._count._all,
      percentage: 0 // Will be calculated on frontend
    }))

    // Enrich department distribution with department names
    const departmentIds = departmentDistribution.map(d => d.departmentId).filter(Boolean)
    const departments = departmentIds.length > 0 ? await prisma.department.findMany({
      where: { id: { in: departmentIds } },
      select: { id: true, name: true, code: true }
    }) : []

    const departmentMap = new Map(departments.map(d => [d.id, d]))
    const enrichedDepartmentStats = departmentDistribution.map(stat => ({
      department: departmentMap.get(stat.departmentId) || { 
        id: stat.departmentId, 
        name: 'Unknown', 
        code: 'UNK' 
      },
      count: stat._count._all,
      percentage: 0 // Will be calculated on frontend
    }))

    // Calculate totals for percentage calculations
    const totalIssues = statusDistribution.reduce((sum, item) => sum + item._count._all, 0)

    ok(res, {
      period,
      totalIssues,
      filters: {
        departmentId: departmentId || null,
        categoryId: categoryId || null,
        startDate: startDate.toISOString(),
        endDate: now.toISOString()
      },
      distributions: {
        status: statusDistribution.map(item => ({
          status: item.status,
          count: item._count._all,
          percentage: totalIssues > 0 ? ((item._count._all / totalIssues) * 100).toFixed(1) : 0
        })),
        priority: priorityDistribution.map(item => ({
          priority: item.priority,
          count: item._count._all,
          percentage: totalIssues > 0 ? ((item._count._all / totalIssues) * 100).toFixed(1) : 0
        })),
        categories: enrichedCategoryStats,
        departments: enrichedDepartmentStats
      },
      trends: {
        daily: dailyTrends.map(item => ({
          date: item.date,
          total: Number(item.count),
          resolved: Number(item.resolved_count)
        }))
      },
      metrics: {
        resolution: {
          averageHours: resolutionMetrics._avg.resolutionTimeHours || 0,
          minHours: resolutionMetrics._min.resolutionTimeHours || 0,
          maxHours: resolutionMetrics._max.resolutionTimeHours || 0,
          totalResolved: resolutionMetrics._count._all
        },
        users: {
          newRegistrations: userMetrics
        },
        sla: {
          breachedCount: await prisma.issue.count({
            where: { ...baseWhere, slaBreached: true }
          }),
          breachRate: totalIssues > 0 ? (await prisma.issue.count({
            where: { ...baseWhere, slaBreached: true }
          }) / totalIssues * 100).toFixed(1) : 0
        }
      },
      generatedAt: now.toISOString()
    })

  } catch (error) {
    console.error('Analytics error:', error)
    return fail(res, 500, 'Failed to generate analytics data')
  }
}

// =====================
// Super Admin Endpoints
// =====================

export const getSuperAdminStats = async (_req, res) => {
  try {
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    const [totalUsers, totalDepartments, totalIssues, activeUsers, pendingApprovals] = await Promise.all([
      prisma.user.count(),
      prisma.department.count(),
      prisma.issue.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.issue.count({ where: { OR: [ { status: 'PENDING' }, { moderationStatus: 'PENDING_REVIEW' } ], createdAt: { gte: startOfDay } } })
    ])

    return ok(res, {
      totalUsers,
      totalDepartments,
      totalIssues,
      systemHealth: 100,
      activeUsers,
      pendingApprovals
    })
  } catch (error) {
    console.error('SuperAdmin stats error:', error)
    return fail(res, 500, 'Failed to load super admin stats')
  }
}

export const getSuperAdminRealtimeIssues = async (_req, res) => {
  try {
    const issues = await prisma.issue.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        reportId: true,
        title: true,
        status: true,
        createdAt: true,
        timeline: {
          orderBy: { createdAt: 'asc' },
          select: { status: true, note: true, createdAt: true }
        }
      }
    })

    const data = issues.map((i) => ({
      reportId: i.reportId,
      title: i.title,
      status: i.status,
      timeline: i.timeline?.map(t => `${t.status} • ${new Date(t.createdAt).toLocaleString()}`).join(' → ') || `Created • ${new Date(i.createdAt).toLocaleString()}`
    }))

    return ok(res, data)
  } catch (error) {
    console.error('SuperAdmin realtime issues error:', error)
    return fail(res, 500, 'Failed to load realtime issues')
  }
}

export const getSuperAdminModeratorPerformance = async (_req, res) => {
  try {
    // Group issues by moderatorId to compute basic performance aggregates
    const groups = await prisma.issue.groupBy({
      by: ['moderatorId'],
      _count: { _all: true },
      where: { moderatorId: { not: null } }
    })

    const moderatorIds = groups.map(g => g.moderatorId).filter(Boolean)
    const moderators = moderatorIds.length ? await prisma.user.findMany({
      where: { id: { in: moderatorIds } },
      select: { id: true, name: true }
    }) : []
    const modMap = new Map(moderators.map(m => [m.id, m]))

    // Average review time based on createdAt -> moderatedAt when available
    const details = await prisma.issue.findMany({
      where: { moderatorId: { not: null } },
      select: { moderatorId: true, createdAt: true, moderatedAt: true, qualityScore: true }
    })

    const agg = new Map()
    for (const d of details) {
      if (!d.moderatorId) continue
      const key = d.moderatorId
      if (!agg.has(key)) agg.set(key, { count: 0, totalMinutes: 0, qualitySum: 0, qualityCount: 0 })
      const a = agg.get(key)
      a.count += 1
      if (d.moderatedAt) {
        const minutes = (d.moderatedAt.getTime() - d.createdAt.getTime()) / 60000
        a.totalMinutes += Math.max(0, minutes)
      }
      if (typeof d.qualityScore === 'number') {
        a.qualitySum += d.qualityScore
        a.qualityCount += 1
      }
    }

    const result = await Promise.all(groups.map(async g => {
      const meta = agg.get(g.moderatorId) || { count: 0, totalMinutes: 0, qualitySum: 0, qualityCount: 0 }
      const avgReviewTime = meta.count ? Math.round((meta.totalMinutes / Math.max(1, meta.count)) * 10) / 10 : 0
      const qualityScore = meta.qualityCount ? Math.round((meta.qualitySum / meta.qualityCount)) : 90
      
      // Calculate accuracy based on approved vs total reviews
      const approvedCount = await prisma.issue.count({
        where: {
          moderatorId: g.moderatorId,
          moderationStatus: 'APPROVED'
        }
      })
      const accuracy = g._count._all > 0 ? Math.round((approvedCount / g._count._all) * 100) : 0
      
      return {
        id: g.moderatorId,
        name: modMap.get(g.moderatorId)?.name || 'Unknown Moderator',
        reviewedCount: g._count._all,
        avgReviewTime,
        accuracy,
        qualityScore
      }
    }))

    return ok(res, result)
  } catch (error) {
    console.error('SuperAdmin moderator performance error:', error)
    return fail(res, 500, 'Failed to load moderator performance')
  }
}

// =====================
// Department Admin Endpoints
// =====================

const resolveDepartmentId = (req) => {
  return req.query.departmentId || req.params.departmentId || req.user?.departmentId || null
}

export const getDepartmentAssignedIssues = async (req, res) => {
  try {
    const departmentId = resolveDepartmentId(req)
    if (!departmentId) return fail(res, 400, 'Department id required')

    const issues = await prisma.issue.findMany({
      where: {
        departmentId,
        status: { in: ['PENDING','TRIAGED','ASSIGNED_TO_STAFF','IN_PROGRESS','WORK_COMPLETED','PENDING_CITIZEN_VERIFICATION'] }
      },
      orderBy: { createdAt: 'desc' },
      take: 25,
      select: {
        id: true,
        title: true,
        address: true,
        priority: true,
        status: true,
        assignedTo: { select: { name: true } },
        assignedToStaffAt: true,
        moderator: { select: { name: true } },
        moderatorNotes: true,
        qualityScore: true,
        reporterName: true,
        createdAt: true,
        category: { select: { name: true } }
      }
    })

    const data = issues.map(i => ({
      id: i.id,
      title: i.title,
      category: i.category?.name || 'General',
      location: i.address || 'N/A',
      priority: String(i.priority).toLowerCase(),
      status: i.status,
      assignedStaff: i.assignedTo?.name || undefined,
      assignedAt: i.assignedToStaffAt ? i.assignedToStaffAt.toISOString() : '',
      moderatorName: i.moderator?.name || '—',
      moderatorNotes: i.moderatorNotes || '',
      qualityScore: i.qualityScore || 0,
      citizenName: i.reporterName,
      createdAt: i.createdAt.toISOString()
    }))

    return ok(res, data)
  } catch (error) {
    console.error('Department assigned issues error:', error)
    return fail(res, 500, 'Failed to load department issues')
  }
}

export const getDepartmentStaff = async (req, res) => {
  try {
    const departmentId = resolveDepartmentId(req)
    if (!departmentId) return fail(res, 400, 'Department id required')

    const staff = await prisma.user.findMany({
      where: { departmentId, roles: { hasSome: ['staff','moderator'] } },
      select: {
        id: true,
        name: true,
        roles: true,
        isActive: true,
        assignedIssues: {
          where: { status: { in: ['PENDING','TRIAGED','ASSIGNED_TO_STAFF','IN_PROGRESS'] } },
          select: { id: true }
        }
      }
    })

    const data = staff.map(s => ({
      id: s.id,
      name: s.name,
      role: s.roles.includes('moderator') ? 'Moderator' : 'Staff',
      activeIssues: s.assignedIssues.length,
      status: s.isActive ? 'Active' : 'Inactive',
      performance: '—'
    }))

    return ok(res, data)
  } catch (error) {
    console.error('Department staff error:', error)
    return fail(res, 500, 'Failed to load department staff')
  }
}

export const getDepartmentStats = async (req, res) => {
  try {
    const departmentId = resolveDepartmentId(req)
    if (!departmentId) return fail(res, 400, 'Department id required')

    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    const [activeIssues, resolvedToday, staffCount, avg] = await Promise.all([
      prisma.issue.count({ where: { departmentId, status: { in: ['PENDING','TRIAGED','ASSIGNED_TO_STAFF','IN_PROGRESS'] } } }),
      prisma.issue.count({ where: { departmentId, status: 'RESOLVED', resolvedAt: { gte: startOfDay } } }),
      prisma.user.count({ where: { departmentId, roles: { hasSome: ['staff','moderator'] } } }),
      prisma.issue.aggregate({ where: { departmentId, status: 'RESOLVED', resolutionTimeHours: { not: null } }, _avg: { resolutionTimeHours: true } })
    ])

    const avgResponseTime = avg._avg.resolutionTimeHours ? `${Math.round(avg._avg.resolutionTimeHours * 10) / 10}h` : '0h'

    return ok(res, { activeIssues, resolvedToday, staffCount, avgResponseTime })
  } catch (error) {
    console.error('Department stats error:', error)
    return fail(res, 500, 'Failed to load department stats')
  }
}

export const createCategory = async (req, res) => {
  const { name, description } = req.body
  if (!name) return fail(res, 400, 'Name is required')
  const existing = await prisma.issueCategory.findUnique({ where: { name } })
  if (existing) return fail(res, 409, 'Category already exists')
  const cat = await prisma.issueCategory.create({ data: { name, description: description || '' } })
  created(res, { category: cat })
}

export const listCategories = async (_req, res) => {
  const items = await prisma.issueCategory.findMany({ orderBy: { name: 'asc' } })
  ok(res, { items })
}

export const leaderboard = async (_req, res) => {
  // Aggregate via two queries due to Prisma limitations
  const reporters = await prisma.issue.groupBy({ 
    by: ['reporterId'], 
    _count: true, 
    where: { reporterId: { not: null } }, 
    orderBy: { _count: { reporterId: 'desc' } }, 
    take: 50 
  })
  const resolved = await prisma.issue.groupBy({ 
    by: ['reporterId'], 
    _count: true, 
    where: { status: 'RESOLVED', reporterId: { not: null } } 
  })
  const resolvedMap = new Map(resolved.map(r => [r.reporterId, r._count.reporterId || r._count._all || 0]))
  const userIds = reporters.map(r => r.reporterId).filter(Boolean)
  const users = await prisma.user.findMany({ where: { id: { in: userIds } }, select: { id: true, name: true, email: true } })
  const usersById = new Map(users.map(u => [u.id, u]))
  const items = reporters.slice(0, 20).map(r => ({
    user: usersById.get(r.reporterId) || { id: r.reporterId },
    total: r._count.reporterId || r._count._all || 0,
    resolved: resolvedMap.get(r.reporterId) || 0,
  }))
  ok(res, { items })
}

export const getSystemStats = async (req, res) => {
  try {
    // Get basic system stats for AdminFooter
    const [
      totalUsers,
      totalIssues,
      resolvedIssues,
      pendingIssues
    ] = await Promise.all([
      prisma.user.count(),
      prisma.issue.count(),
      prisma.issue.count({ where: { status: 'RESOLVED' } }),
      prisma.issue.count({ where: { status: { in: ['PENDING', 'TRIAGED', 'IN_PROGRESS'] } } })
    ])

    ok(res, {
      totalUsers,
      totalIssues,
      resolvedIssues,
      pendingIssues,
      lastUpdated: new Date().toISOString()
    })

  } catch (error) {
    console.error('System stats error:', error)
    return fail(res, 500, 'Failed to load system stats')
  }
}

export const getRealtimeUserCount = async (req, res) => {
  try {
    // Get real-time user count statistics
    const [
      totalUsers,
      activeUsers,
      newUsersToday,
      verifiedUsers
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.user.count({ 
        where: { 
          createdAt: { 
            gte: new Date(new Date().setHours(0, 0, 0, 0)) 
          } 
        } 
      }),
      prisma.user.count({ where: { isVerified: true } })
    ])

    // Get user registration trend (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    const weeklyRegistrations = await prisma.user.count({
      where: {
        createdAt: { gte: sevenDaysAgo }
      }
    })

    ok(res, {
      totalUsers,
      activeUsers,
      newUsersToday,
      verifiedUsers,
      weeklyRegistrations,
      lastUpdated: new Date().toISOString()
    })

  } catch (error) {
    console.error('Realtime user count error:', error)
    return fail(res, 500, 'Failed to load realtime user count')
  }
}

export const getOrganizationStats = async (req, res) => {
  try {
    const departmentId = resolveDepartmentId(req)
    if (!departmentId) return fail(res, 400, 'Department id required')

    // Get department info first
    const department = await prisma.department.findUnique({
      where: { id: departmentId },
      select: { name: true, code: true }
    })

    if (!department) return fail(res, 404, 'Department not found')

    const [
      totalIssues,
      pendingIssues,
      resolvedIssues,
      inProgressIssues,
      totalStaff,
      activeStaff,
      recentIssues,
      staffPerformance
    ] = await Promise.all([
      // Issue counts
      prisma.issue.count({ where: { departmentId } }),
      prisma.issue.count({ where: { departmentId, status: 'PENDING' } }),
      prisma.issue.count({ where: { departmentId, status: 'RESOLVED' } }),
      prisma.issue.count({ where: { departmentId, status: 'IN_PROGRESS' } }),
      
      // Staff counts
      prisma.user.count({ where: { departmentId, roles: { hasSome: ['staff', 'moderator'] } } }),
      prisma.user.count({ where: { departmentId, roles: { hasSome: ['staff', 'moderator'] }, isActive: true } }),
      
      // Recent issues
      prisma.issue.findMany({
        where: { departmentId },
        include: {
          assignedTo: { select: { name: true } },
          category: { select: { name: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      }),
      
      // Staff performance
      prisma.user.findMany({
        where: { 
          departmentId, 
          roles: { hasSome: ['staff', 'moderator'] } 
        },
        select: {
          id: true,
          name: true
        },
        take: 10
      })
    ])

    // Format response to match frontend expectations
    const departmentStats = {
      departmentName: department.name,
      totalIssues,
      pendingIssues,
      resolvedIssues,
      inProgressIssues,
      totalStaff,
      activeStaff
    }

    const formattedRecentIssues = recentIssues.map(issue => ({
      id: issue.id,
      title: issue.title,
      priority: issue.priority.toLowerCase(),
      status: issue.status.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()),
      assignee: issue.assignedTo?.name || 'Unassigned',
      time: issue.createdAt.toLocaleString()
    }))

    const formattedStaffPerformance = await Promise.all(
      staffPerformance.map(async (staff) => {
        const resolved = await prisma.issue.count({
          where: { assignedToId: staff.id, status: 'RESOLVED' }
        })
        const pending = await prisma.issue.count({
          where: { assignedToId: staff.id, status: { in: ['PENDING', 'IN_PROGRESS'] } }
        })
        const total = resolved + pending
        const efficiency = total > 0 ? Math.round((resolved / total) * 100) : 0

        return {
          name: staff.name,
          resolved,
          pending,
          efficiency
        }
      })
    )

    ok(res, {
      departmentStats,
      recentIssues: formattedRecentIssues,
      staffPerformance: formattedStaffPerformance,
      areaStats: [] // Area-wise stats disabled by default for performance
    })

  } catch (error) {
    console.error('Organization stats error:', error)
    return fail(res, 500, 'Failed to load organization stats')
  }
}

export const getModeratorStats = async (req, res) => {
  try {
    const userId = req.user.id
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())

    const [
      pendingReviews,
      reviewedToday,
      flaggedContent,
      escalatedIssues,
      totalReports,
      totalReviewed
    ] = await Promise.all([
      // Issues pending moderation
      prisma.issue.count({ 
        where: { 
          moderationStatus: 'PENDING_REVIEW'
        } 
      }),
      
      // Issues reviewed today by this moderator
      prisma.issue.count({ 
        where: { 
          moderatorId: userId,
          moderatedAt: { gte: startOfDay }
        } 
      }),
      
      // Flagged content
      prisma.issue.count({ 
        where: { 
          isFlagged: true,
          status: { not: 'RESOLVED' }
        } 
      }),
      
      // Escalated issues
      prisma.issue.count({ 
        where: { 
          isEscalated: true,
          status: { not: 'RESOLVED' }
        } 
      }),
      
      // Total reports assigned to this moderator
      prisma.issue.count({ 
        where: { 
          moderatorId: userId
        } 
      }),
      
      // Total reviewed by this moderator
      prisma.issue.count({ 
        where: { 
          moderatorId: userId,
          moderationStatus: { in: ['APPROVED', 'REJECTED'] }
        } 
      })
    ])

    const approvalRate = totalReviewed > 0 ? 
      Math.round((await prisma.issue.count({ 
        where: { 
          moderatorId: userId,
          moderationStatus: 'APPROVED'
        } 
      }) / totalReviewed) * 100) : 0

    ok(res, {
      pendingReviews,
      reviewedToday,
      flaggedContent,
      escalatedIssues,
      totalReports,
      approvalRate
    })

  } catch (error) {
    console.error('Moderator stats error:', error)
    return fail(res, 500, 'Failed to load moderator stats')
  }
}

export const getModeratorPending = async (req, res) => {
  try {
    const pendingIssues = await prisma.issue.findMany({
      where: {
        moderationStatus: 'PENDING_REVIEW'
      },
      include: {
        reporter: { select: { name: true, email: true } },
        category: { select: { name: true } },
        images: { select: { id: true, url: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    })

    const formattedIssues = pendingIssues.map(issue => ({
      id: issue.id,
      title: issue.title,
      description: issue.description,
      address: issue.address,
      latitude: issue.latitude,
      longitude: issue.longitude,
      reporterName: issue.reporter?.name || 'Anonymous',
      reporterEmail: issue.reporter?.email,
      createdAt: issue.createdAt.toISOString(),
      priority: issue.priority,
      categoryName: issue.category?.name,
      images: issue.images || [],
      reportId: issue.reportId
    }))

    ok(res, formattedIssues)

  } catch (error) {
    console.error('Moderator pending error:', error)
    return fail(res, 500, 'Failed to load pending reviews')
  }
}

export const getDepartmentRealtimeStats = async (req, res) => {
  try {
    const departmentId = resolveDepartmentId(req)
    if (!departmentId) return fail(res, 400, 'Department id required')

    // Get department info
    const department = await prisma.department.findUnique({
      where: { id: departmentId },
      select: { name: true, code: true }
    })

    if (!department) return fail(res, 404, 'Department not found')

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const [
      totalIssues,
      activeIssues,
      resolvedIssues,
      pendingIssues,
      criticalIssues,
      escalatedIssues,
      todayIssues,
      weekIssues,
      monthIssues,
      staffCount,
      activeStaff,
      avgResolutionTime,
      recentIssues
    ] = await Promise.all([
      // Issue counts
      prisma.issue.count({ where: { departmentId } }),
      prisma.issue.count({ where: { departmentId, status: { in: ['TRIAGED', 'ASSIGNED_TO_STAFF', 'IN_PROGRESS'] } } }),
      prisma.issue.count({ where: { departmentId, status: 'RESOLVED' } }),
      prisma.issue.count({ where: { departmentId, status: 'PENDING' } }),
      prisma.issue.count({ where: { departmentId, priority: 'CRITICAL', status: { not: 'RESOLVED' } } }),
      prisma.issue.count({ where: { departmentId, isEscalated: true, status: { not: 'RESOLVED' } } }),
      
      // Time-based stats
      prisma.issue.count({ where: { departmentId, createdAt: { gte: today } } }),
      prisma.issue.count({ where: { departmentId, createdAt: { gte: thisWeek } } }),
      prisma.issue.count({ where: { departmentId, createdAt: { gte: thisMonth } } }),
      
      // Staff stats
      prisma.user.count({ where: { departmentId, roles: { hasSome: ['staff', 'moderator'] } } }),
      prisma.user.count({ where: { departmentId, roles: { hasSome: ['staff', 'moderator'] }, isActive: true } }),
      
      // Average resolution time
      prisma.issue.aggregate({
        where: { 
          departmentId,
          status: 'RESOLVED',
          resolutionTimeHours: { not: null }
        },
        _avg: { resolutionTimeHours: true }
      }),
      
      // Recent issues for activity feed
      prisma.issue.findMany({
        where: { departmentId },
        include: {
          assignedTo: { select: { name: true } },
          category: { select: { name: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      })
    ])

    // Calculate additional metrics
    const resolutionRate = totalIssues > 0 ? ((resolvedIssues / totalIssues) * 100).toFixed(1) : 0
    const avgResolutionHours = avgResolutionTime._avg.resolutionTimeHours || 0
    const staffUtilization = staffCount > 0 ? ((activeStaff / staffCount) * 100).toFixed(1) : 0

    // Format recent issues
    const formattedRecentIssues = recentIssues.map(issue => ({
      id: issue.id,
      title: issue.title,
      status: issue.status,
      priority: issue.priority,
      assignedTo: issue.assignedTo?.name || 'Unassigned',
      category: issue.category?.name || 'Uncategorized',
      createdAt: issue.createdAt.toISOString(),
      timeAgo: getTimeAgo(issue.createdAt)
    }))

    ok(res, {
      department: {
        id: departmentId,
        name: department.name,
        code: department.code
      },
      overview: {
        totalIssues,
        activeIssues,
        resolvedIssues,
        pendingIssues,
        criticalIssues,
        escalatedIssues,
        resolutionRate: parseFloat(resolutionRate),
        avgResolutionHours: Math.round(avgResolutionHours * 10) / 10
      },
      trends: {
        today: todayIssues,
        thisWeek: weekIssues,
        thisMonth: monthIssues
      },
      staff: {
        totalStaff: staffCount,
        activeStaff,
        utilization: parseFloat(staffUtilization)
      },
      recentActivity: formattedRecentIssues,
      lastUpdated: now.toISOString()
    })

  } catch (error) {
    console.error('Department realtime stats error:', error)
    return fail(res, 500, 'Failed to load department realtime stats')
  }
}

// Helper function to calculate time ago
function getTimeAgo(date) {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`
  } else if (diffHours < 24) {
    return `${diffHours}h ago`
  } else {
    return `${diffDays}d ago`
  }
}


// =====================
// Unimplemented Routes Fix
// =====================

export const updateUserRoles = async (req, res) => {
  try {
    const { userId } = req.params;
    const { roles } = req.body;
    
    if (!roles || !Array.isArray(roles)) {
      return fail(res, 400, 'Roles array is required');
    }
    
    const user = await prisma.user.update({
      where: { id: userId },
      data: { roles }
    });
    
    return ok(res, { user });
  } catch (error) {
    console.error('Update user roles error:', error);
    return fail(res, 500, 'Failed to update user roles');
  }
};

export const activateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await prisma.user.update({
      where: { id: userId },
      data: { isActive: true }
    });
    return ok(res, { user });
  } catch (error) {
    console.error('Activate user error:', error);
    return fail(res, 500, 'Failed to activate user');
  }
};

export const deactivateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await prisma.user.update({
      where: { id: userId },
      data: { isActive: false }
    });
    return ok(res, { user });
  } catch (error) {
    console.error('Deactivate user error:', error);
    return fail(res, 500, 'Failed to deactivate user');
  }
};

export const getCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await prisma.issueCategory.findUnique({
      where: { id }
    });
    if (!category) return fail(res, 404, 'Category not found');
    return ok(res, { category });
  } catch (error) {
    console.error('Get category error:', error);
    return fail(res, 500, 'Failed to get category');
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, icon, color } = req.body;
    
    const category = await prisma.issueCategory.update({
      where: { id },
      data: { name, description, icon, color }
    });
    
    return ok(res, { category });
  } catch (error) {
    console.error('Update category error:', error);
    return fail(res, 500, 'Failed to update category');
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.issueCategory.delete({
      where: { id }
    });
    return ok(res, { message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    return fail(res, 500, 'Failed to delete category');
  }
};

export const updateIssueStatusAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;
    const issue = await prisma.issue.update({
      where: { id },
      data: { status },
      include: { reporter: true, assignedTo: true, department: true }
    });
    await prisma.issueTimeline.create({
      data: { issueId: id, status, note, performedById: req.user.id }
    });
    return ok(res, { issue });
  } catch (error) {
    return fail(res, 500, 'Failed to update issue status', error.message);
  }
};

export const triageIssueAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { departmentId, note } = req.body;
    const issue = await prisma.issue.update({
      where: { id },
      data: { departmentId, status: 'TRIAGED' },
      include: { reporter: true, assignedTo: true, department: true }
    });
    await prisma.issueTimeline.create({
      data: { issueId: id, status: 'TRIAGED', note, performedById: req.user.id }
    });
    return ok(res, { issue });
  } catch (error) {
    return fail(res, 500, 'Failed to triage issue', error.message);
  }
};

export const assignIssueAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { staffUserId, note } = req.body;
    const issue = await prisma.issue.update({
      where: { id },
      data: { assignedToId: staffUserId, status: 'ASSIGNED_TO_STAFF' },
      include: { reporter: true, assignedTo: true, department: true }
    });
    await prisma.issueTimeline.create({
      data: { issueId: id, status: 'ASSIGNED_TO_STAFF', note, performedById: req.user.id }
    });
    return ok(res, { issue });
  } catch (error) {
    return fail(res, 500, 'Failed to assign issue', error.message);
  }
};

export const closeIssueAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { note } = req.body;
    const issue = await prisma.issue.update({
      where: { id },
      data: { status: 'CLOSED' },
      include: { reporter: true, assignedTo: true, department: true }
    });
    await prisma.issueTimeline.create({
      data: { issueId: id, status: 'CLOSED', note, performedById: req.user.id }
    });
    return ok(res, { issue });
  } catch (error) {
    return fail(res, 500, 'Failed to close issue', error.message);
  }
};

export const bulkUpdateStatusAdmin = async (req, res) => {
  try {
    const { ids, status } = req.body;
    await prisma.issue.updateMany({
      where: { id: { in: ids } },
      data: { status }
    });
    for(const id of ids) {
      await prisma.issueTimeline.create({
        data: { issueId: id, status, note: 'Bulk status update', performedById: req.user.id }
      });
    }
    const items = await prisma.issue.findMany({ where: { id: { in: ids } }});
    return ok(res, { items });
  } catch (error) {
    return fail(res, 500, 'Failed to bulk update status', error.message);
  }
};

export const getActivityLogs = async (req, res) => {
  try {
    const { userId, issueId, page = 1, limit = 20 } = req.query;
    
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;
    
    const where = {};
    if (userId) where.userId = userId;
    if (issueId) where.issueId = issueId;
    
    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
        include: {
          user: { select: { name: true, email: true } },
        }
      }),
      prisma.activityLog.count({ where })
    ]);
    
    return ok(res, {
      items: logs,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Get activity logs error:', error);
    return fail(res, 500, 'Failed to get activity logs');
  }
};
