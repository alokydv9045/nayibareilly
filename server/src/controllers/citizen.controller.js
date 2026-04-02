import prisma from '../config/prisma.js'
import { ok, fail } from '../utils/apiResponse.js'
import redisClient from '../config/redis.js'

/**
 * Get citizen's personal dashboard statistics
 */
export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id
    const cacheKey = `citizen:dashboard:${userId}`

    // Try to get from cache first
    try {
      const cachedStats = await redisClient.get(cacheKey)
      if (cachedStats) {
        return ok(res, JSON.parse(cachedStats))
      }
    } catch (error) {
      console.error('[Redis] Error getting cached citizen stats:', error)
    }

    // Fetch user's issue statistics
    const [totalIssues, pendingIssues, inProgressIssues, resolvedIssues, closedIssues] = await Promise.all([
      prisma.issue.count({ where: { reporterId: userId } }),
      prisma.issue.count({ where: { reporterId: userId, status: 'PENDING' } }),
      prisma.issue.count({ where: { reporterId: userId, status: 'IN_PROGRESS' } }),
      prisma.issue.count({ where: { reporterId: userId, status: 'RESOLVED' } }),
      prisma.issue.count({ where: { reporterId: userId, status: 'CLOSED' } }),
    ])

    // Calculate average resolution time for resolved issues
    const resolvedIssuesWithTime = await prisma.issue.findMany({
      where: {
        reporterId: userId,
        status: { in: ['RESOLVED', 'CLOSED'] }
      },
      select: {
        createdAt: true,
        updatedAt: true
      }
    })

    let avgResolutionTime = '0 days'
    if (resolvedIssuesWithTime.length > 0) {
      const totalDays = resolvedIssuesWithTime.reduce((sum, issue) => {
        const days = Math.floor((new Date(issue.updatedAt) - new Date(issue.createdAt)) / (1000 * 60 * 60 * 24))
        return sum + days
      }, 0)
      const avgDays = Math.round(totalDays / resolvedIssuesWithTime.length)
      avgResolutionTime = `${avgDays} day${avgDays !== 1 ? 's' : ''}`
    }

    // Calculate community rank (based on number of issues reported)
    const issueCounts = await prisma.issue.groupBy({
      by: ['reporterId'],
      _count: {
        id: true,
      },
      where: {
        reporterId: {
          not: null,
        },
      },
    });

    const usersWithMoreIssues = issueCounts.filter(
      (group) => group._count.id > totalIssues
    );

    const communityRank = usersWithMoreIssues.length + 1;

    // Calculate impact score (simple formula: resolved * 10 + total * 2)
    const impactScore = (resolvedIssues * 10) + (totalIssues * 2)

    const statsData = {
      totalIssues,
      pendingIssues,
      inProgressIssues,
      resolvedIssues,
      closedIssues,
      avgResolutionTime,
      communityRank,
      impactScore
    }

    // Cache for 2 minutes
    try {
      await redisClient.set(cacheKey, JSON.stringify(statsData), 'EX', 120)
    } catch (error) {
      console.error('[Redis] Error setting cached citizen stats:', error)
    }

    return ok(res, statsData)
  } catch (error) {
    console.error('Error fetching citizen dashboard stats:', error)
    return fail(res, 500, 'Failed to load dashboard statistics')
  }
}
