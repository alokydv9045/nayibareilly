import prisma from '../config/prisma.js'
import { ok, fail } from '../utils/apiResponse.js'
import { validationResult } from 'express-validator'

/**
 * Get public statistics for homepage
 * No authentication required
 * Returns: total issues, resolved, pending, active users
 */
export const getPublicStats = async (req, res) => {
  try {
    // Get issue counts
    const [
      totalIssues,
      resolvedIssues,
      inProgressIssues,
      openIssues,
      activeUsers
    ] = await Promise.all([
      // Total approved issues (visible to public)
      prisma.issue.count({
        where: { moderationStatus: 'APPROVED' }
      }),
      
      // Resolved issues
      prisma.issue.count({
        where: { 
          moderationStatus: 'APPROVED',
          status: 'RESOLVED'
        }
      }),
      
      // In progress issues
      prisma.issue.count({
        where: { 
          moderationStatus: 'APPROVED',
          status: 'IN_PROGRESS'
        }
      }),
      
      // Open issues
      prisma.issue.count({
        where: { 
          moderationStatus: 'APPROVED',
          status: 'PENDING'
        }
      }),
      
      // Active users (verified citizens)
      prisma.user.count({
        where: { 
          isVerified: true,
          roles: {
            has: 'citizen'
          }
        }
      })
    ])

    // Calculate response time (average days to resolve)
    const resolvedWithTimestamp = await prisma.issue.findMany({
      where: { 
        moderationStatus: 'APPROVED',
        status: 'RESOLVED',
        resolvedAt: { not: null }
      },
      select: {
        createdAt: true,
        resolvedAt: true
      },
      take: 100 // Sample last 100 resolved issues for performance
    })

    let avgResponseDays = 0
    if (resolvedWithTimestamp.length > 0) {
      const totalDays = resolvedWithTimestamp.reduce((sum, issue) => {
        const days = Math.abs(
          (new Date(issue.resolvedAt).getTime() - new Date(issue.createdAt).getTime()) 
          / (1000 * 60 * 60 * 24)
        )
        return sum + days
      }, 0)
      avgResponseDays = Math.round(totalDays / resolvedWithTimestamp.length)
    }

    // Get issues created today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const issuesToday = await prisma.issue.count({
      where: {
        moderationStatus: 'APPROVED',
        createdAt: { gte: today }
      }
    })

    const stats = {
      totalIssues,
      resolvedIssues,
      inProgressIssues,
      openIssues,
      pendingIssues: openIssues, // Alias for consistency
      activeUsers,
      avgResponseDays,
      issuesToday,
      resolutionRate: totalIssues > 0 
        ? Math.round((resolvedIssues / totalIssues) * 100) 
        : 0
    }

    return ok(res, stats)
  } catch (error) {
    console.error('Error fetching public stats:', error)
    return fail(res, 500, 'Failed to fetch public statistics', error.message)
  }
}

/**
 * Get public reports feed for homepage
 * No authentication required
 * Supports: pagination, filtering, sorting
 */
export const getPublicReports = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return fail(res, 400, 'Validation failed', errors.array())
    }

    const {
      page = 1,
      limit = 12,
      category,
      status,
      sort = 'newest',
      search
    } = req.query

    const pageNum = parseInt(page, 10)
    const limitNum = parseInt(limit, 10)
    const skip = (pageNum - 1) * limitNum

    // Build where clause
    const where = {
      moderationStatus: 'APPROVED' // Only show approved issues publicly
    }

    if (category && category !== 'all') {
      where.category = {
        name: category
      }
    }

    if (status && status !== 'all') {
      where.status = status
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Build orderBy clause
    let orderBy = {}
    switch (sort) {
      case 'oldest':
        orderBy = { createdAt: 'asc' }
        break
      case 'votes':
        orderBy = { totalVotes: 'desc' }
        break
      case 'newest':
      default:
        orderBy = { createdAt: 'desc' }
    }

    // Fetch issues and total count in parallel
    const [issues, totalCount] = await Promise.all([
      prisma.issue.findMany({
        where,
        orderBy,
        skip,
        take: limitNum,
        select: {
          id: true,
          reportId: true,
          title: true,
          description: true,
          status: true,
          priority: true,
          upvotes: true,
          downvotes: true,
          totalVotes: true,
          viewCount: true,
          latitude: true,
          longitude: true,
          address: true,
          createdAt: true,
          updatedAt: true,
          resolvedAt: true,
          category: {
            select: {
              id: true,
              name: true,
              icon: true,
              color: true
            }
          },
          reporter: {
            select: {
              id: true,
              name: true,
              avatarUrl: true
            }
          },
          department: {
            select: {
              id: true,
              name: true
            }
          },
          images: {
            select: {
              id: true,
              url: true,
              filename: true
            }
          },
          _count: {
            select: {
              comments: true
            }
          }
        }
      }),
      prisma.issue.count({ where })
    ])

    // Transform issues to match frontend expectations
    const transformedIssues = issues.map(issue => ({
      ...issue,
      categoryName: issue.category?.name || 'Uncategorized',
      votesCount: issue.totalVotes,
      commentsCount: issue._count?.comments || 0,
      viewsCount: issue.viewCount
    }))

    const totalPages = Math.ceil(totalCount / limitNum)

    return ok(res, {
      issues: transformedIssues,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalCount,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    })
  } catch (error) {
    console.error('Error fetching public reports:', error)
    return fail(res, 500, 'Failed to fetch public reports', error.message)
  }
}

/**
 * Get a single public report by ID
 * No authentication required
 */
export const getPublicReportById = async (req, res) => {
  try {
    const { id } = req.params;

    const issue = await prisma.issue.findUnique({
      where: { 
        id,
        moderationStatus: 'APPROVED' // Ensure only approved issues are accessible
      },
      select: {
        id: true,
        reportId: true,
        title: true,
        description: true,
        status: true,
        priority: true,
        upvotes: true,
        downvotes: true,
        totalVotes: true,
        viewCount: true,
        latitude: true,
        longitude: true,
        address: true,
        createdAt: true,
        updatedAt: true,
        resolvedAt: true,
        category: {
          select: {
            id: true,
            name: true,
            icon: true,
            color: true
          }
        },
        reporter: {
          select: {
            id: true,
            name: true,
            avatarUrl: true
          }
        },
        department: {
          select: {
            id: true,
            name: true
          }
        },
        images: {
          select: {
            id: true,
            url: true
          }
        },
        timeline: {
          orderBy: { createdAt: 'asc' },
          select: {
            status: true,
            createdAt: true,
            note: true,
            performedById: true
          }
        },
        comments: {
          where: {
            isPublic: true,
            isInternal: false
          },
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            content: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                name: true,
                roles: true,
                avatarUrl: true
              }
            }
          }
        }
      }
    });

    if (!issue) {
      return fail(res, 404, 'Report not found or not approved for public viewing');
    }

    // Increment view count in background
    prisma.issue.update({
      where: { id },
      data: { viewCount: { increment: 1 } }
    }).catch(e => console.error('Error incrementing view count:', e));

    return ok(res, issue);
  } catch (error) {
    console.error('Error fetching public report details:', error);
    return fail(res, 500, 'Failed to fetch public report details', error.message);
  }
}

/**
 * Get public category statistics for homepage filters
 * No authentication required
 */
export const getPublicCategories = async (req, res) => {
  try {
    // Get all approved issues grouped by category
    const categories = await prisma.issue.groupBy({
      by: ['categoryId'],
      where: {
        moderationStatus: 'APPROVED',
        categoryId: { not: null }
      },
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      }
    })

    // Get category names
    const categoryIds = categories.map(c => c.categoryId)
    const categoryDetails = await prisma.issueCategory.findMany({
      where: {
        id: { in: categoryIds }
      },
      select: {
        id: true,
        name: true,
        icon: true,
        color: true
      }
    })

    const categoriesWithStats = categories.map(cat => {
      const details = categoryDetails.find(d => d.id === cat.categoryId)
      return {
        id: cat.categoryId,
        name: details?.name || 'Unknown',
        icon: details?.icon,
        color: details?.color,
        count: cat._count.id
      }
    })

    return ok(res, categoriesWithStats)
  } catch (error) {
    console.error('Error fetching public categories:', error)
    return fail(res, 500, 'Failed to fetch public categories', error.message)
  }
}

/**
 * Get recent activity for homepage live feed
 * No authentication required
 * Shows last 10 activities
 */
export const getRecentActivity = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10

    // Get recently created and resolved issues
    const recentIssues = await prisma.issue.findMany({
      where: {
        moderationStatus: 'APPROVED',
        OR: [
          { createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }, // Last 24 hours
          { resolvedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }
        ]
      },
      select: {
        id: true,
        reportId: true,
        title: true,
        status: true,
        createdAt: true,
        resolvedAt: true,
        category: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      },
      take: limit
    })

    const activities = recentIssues.map(issue => ({
      id: issue.id,
      reportId: issue.reportId,
      title: issue.title,
      category: issue.category?.name || 'Uncategorized',
      type: issue.resolvedAt ? 'resolved' : 'created',
      timestamp: issue.resolvedAt || issue.createdAt
    }))

    return ok(res, activities)
  } catch (error) {
    console.error('Error fetching recent activity:', error)
    return fail(res, 500, 'Failed to fetch recent activity', error.message)
  }
}

/**
 * Get public map data
 * Returns issues with location data for map visualization
 * No authentication required
 */
export const getPublicMapData = async (req, res) => {
  try {
    const issues = await prisma.issue.findMany({
      where: {
        // Only show approved issues
        moderationStatus: 'APPROVED',
        // Only show issues with location data
        AND: [
          { latitude: { not: null } },
          { longitude: { not: null } }
        ]
      },
      select: {
        id: true,
        title: true,
        priority: true,
        status: true,
        latitude: true,
        longitude: true,
        address: true,
        ward: true,
        createdAt: true,
        description: true,
        upvotes: true,
        viewCount: true,
        category: {
          select: {
            name: true,
            icon: true,
            color: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 1000 // Limit to recent 1000 issues for performance
    })

    // Transform data for public consumption
    const publicIssues = issues.map(issue => ({
      id: issue.id,
      title: issue.title,
      category: issue.category?.name || 'OTHER',
      priority: issue.priority,
      status: issue.status,
      location: {
        latitude: issue.latitude,
        longitude: issue.longitude,
        address: issue.address,
        ward: issue.ward
      },
      createdAt: issue.createdAt,
      description: issue.description ? issue.description.substring(0, 200) + '...' : '', // Truncate for privacy
      upvotes: issue.upvotes || 0,
      viewCount: issue.viewCount || 0
    }))

    return ok(res, {
      issues: publicIssues,
      total: publicIssues.length,
      lastUpdated: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching public map data:', error)
    return fail(res, 500, 'Failed to fetch map data', error.message)
  }
}

