import prisma from '../config/prisma.js'
import { ok, created, fail } from '../utils/apiResponse.js'
import logger from '../utils/logger.js'

/**
 * Approve an issue and assign to department
 */
export const approveIssue = async (req, res) => {
  try {
    const { id } = req.params
    const { departmentId, priority, notes } = req.body
    const moderatorId = req.user.id

    if (!departmentId) {
      return fail(res, 400, 'Department ID is required')
    }

    // Verify department exists
    const department = await prisma.department.findUnique({
      where: { id: departmentId }
    })

    if (!department) {
      return fail(res, 404, 'Department not found')
    }

    // Update issue
    const issue = await prisma.issue.update({
      where: { id },
      data: {
        status: 'TRIAGED',
        moderationStatus: 'APPROVED',
        departmentId,
        moderatorId,
        moderatedAt: new Date(),
        priority: priority || undefined,
        moderatorNotes: notes || undefined,
        timeline: {
          create: {
            status: 'TRIAGED',
            note: notes || `Approved by moderator and assigned to ${department.name}`,
            performedById: moderatorId
          }
        }
      },
      include: {
        reporter: {
          select: { id: true, name: true, email: true }
        },
        category: true,
        department: true
      }
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: moderatorId,
        action: 'ASSIGNED',
        issueId: issue.id,
        description: `Issue approved and assigned to ${department.name}`,
        metadata: { departmentId, priority, notes }
      }
    })

    // Emit real-time updates
    try {
      const io = req.app.get('io')
      
      // Notify about issue update
      io.emit('issue:status', {
        id: issue.id,
        status: issue.status,
        moderationStatus: issue.moderationStatus,
        departmentId: issue.departmentId
      })

      // Notify department
      if (issue.departmentId) {
        io.to(`department:${issue.departmentId}`).emit('department:new-issue', {
          id: issue.id,
          title: issue.title,
          priority: issue.priority,
          category: issue.category?.name
        })
      }

      // Update moderator stats
      io.to(`moderator:${moderatorId}`).emit('moderator:stats', {
        action: 'approved',
        issueId: issue.id
      })
    } catch (error) {
      logger.warn('Failed to emit socket events for issue approval', {
        error: error.message,
        issueId: issue.id
      })
    }

    logger.info('Issue approved by moderator', {
      issueId: issue.id,
      moderatorId,
      departmentId,
      priority
    })

    return ok(res, { issue })

  } catch (error) {
    logger.error('Error approving issue', {
      error: error.message,
      stack: error.stack,
      issueId: req.params.id
    })
    return fail(res, 500, 'Failed to approve issue')
  }
}

/**
 * Reject an issue
 */
export const rejectIssue = async (req, res) => {
  try {
    const { id } = req.params
    const { reason } = req.body
    const moderatorId = req.user.id

    if (!reason) {
      return fail(res, 400, 'Rejection reason is required')
    }

    const issue = await prisma.issue.update({
      where: { id },
      data: {
        status: 'REJECTED',
        moderationStatus: 'REJECTED',
        moderatorId,
        moderatedAt: new Date(),
        moderatorNotes: reason,
        timeline: {
          create: {
            status: 'REJECTED',
            note: `Rejected by moderator: ${reason}`,
            performedById: moderatorId
          }
        }
      },
      include: {
        reporter: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: moderatorId,
        action: 'REJECTED',
        issueId: issue.id,
        description: `Issue rejected by moderator`,
        metadata: { reason }
      }
    })

    // Emit real-time update
    try {
      const io = req.app.get('io')
      io.emit('issue:status', {
        id: issue.id,
        status: issue.status,
        moderationStatus: issue.moderationStatus
      })

      // Notify reporter
      if (issue.reporter?.id) {
        io.to(`user:${issue.reporter.id}`).emit('issue:rejected', {
          id: issue.id,
          title: issue.title,
          reason
        })
      }
    } catch (error) {
      logger.warn('Failed to emit socket events for issue rejection', {
        error: error.message,
        issueId: issue.id
      })
    }

    logger.info('Issue rejected by moderator', {
      issueId: issue.id,
      moderatorId,
      reason
    })

    return ok(res, { issue })

  } catch (error) {
    logger.error('Error rejecting issue', {
      error: error.message,
      stack: error.stack,
      issueId: req.params.id
    })
    return fail(res, 500, 'Failed to reject issue')
  }
}

/**
 * Request more information for an issue
 */
export const requestMoreInfo = async (req, res) => {
  try {
    const { id } = req.params
    const { message, fields } = req.body
    const moderatorId = req.user.id

    if (!message) {
      return fail(res, 400, 'Message is required')
    }

    const issue = await prisma.issue.update({
      where: { id },
      data: {
        moderationStatus: 'NEEDS_MORE_INFO',
        moderatorId,
        moderatedAt: new Date(),
        moderatorNotes: message,
        timeline: {
          create: {
            status: 'NEEDS_MORE_INFO',
            note: `More information requested: ${message}`,
            performedById: moderatorId
          }
        }
      },
      include: {
        reporter: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    // Create notification for reporter
    if (issue.reporter?.id) {
      await prisma.notification.create({
        data: {
          userId: issue.reporter.id,
          title: 'More Information Required',
          message: `Additional information needed for your report: ${issue.title}`,
          type: 'ISSUE_UPDATE',
          relatedIssueId: issue.id,
          metadata: { message, fields }
        }
      })
    }

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: moderatorId,
        action: 'COMMENTED',
        issueId: issue.id,
        description: 'Requested more information',
        metadata: { message, fields }
      }
    })

    // Emit real-time update
    try {
      const io = req.app.get('io')
      
      if (issue.reporter?.id) {
        io.to(`user:${issue.reporter.id}`).emit('issue:more-info-requested', {
          id: issue.id,
          title: issue.title,
          message,
          fields
        })
      }

      io.emit('issue:status', {
        id: issue.id,
        moderationStatus: issue.moderationStatus
      })
    } catch (error) {
      logger.warn('Failed to emit socket events', {
        error: error.message
      })
    }

    logger.info('More information requested for issue', {
      issueId: issue.id,
      moderatorId
    })

    return ok(res, { issue })

  } catch (error) {
    logger.error('Error requesting more info', {
      error: error.message,
      issueId: req.params.id
    })
    return fail(res, 500, 'Failed to request more information')
  }
}

/**
 * Mark an issue as spam
 */
export const markAsSpam = async (req, res) => {
  try {
    const { id } = req.params
    const { reason } = req.body
    const moderatorId = req.user.id

    const issue = await prisma.issue.update({
      where: { id },
      data: {
        moderationStatus: 'SPAM_FLAGGED',
        status: 'REJECTED',
        isFlagged: true,
        moderatorId,
        moderatedAt: new Date(),
        moderatorNotes: `Marked as spam: ${reason || 'No reason provided'}`,
        timeline: {
          create: {
            status: 'SPAM',
            note: `Marked as spam by moderator${reason ? `: ${reason}` : ''}`,
            performedById: moderatorId
          }
        }
      },
      include: {
        reporter: {
          select: { id: true, email: true }
        }
      }
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: moderatorId,
        action: 'REJECTED',
        issueId: issue.id,
        description: 'Marked as spam',
        metadata: { reason, spam: true }
      }
    })

    // Check if reporter has multiple spam reports
    const spamCount = await prisma.issue.count({
      where: {
        reporterId: issue.reporterId,
        moderationStatus: 'SPAM_FLAGGED'
      }
    })

    // Flag user if multiple spam reports
    if (spamCount >= 3) {
      await prisma.user.update({
        where: { id: issue.reporterId },
        data: { isFlagged: true }
      })

      logger.warn('User flagged for multiple spam reports', {
        userId: issue.reporterId,
        spamCount
      })
    }

    try {
      const io = req.app.get('io')
      io.emit('issue:status', {
        id: issue.id,
        status: issue.status,
        moderationStatus: issue.moderationStatus
      })
    } catch (error) {
      logger.warn('Failed to emit socket events for spam mark', {
        error: error.message,
        issueId: issue.id
      })
    }

    logger.info('Issue marked as spam', {
      issueId: issue.id,
      moderatorId,
      spamCount
    })

    return ok(res, { issue, spamCount })

  } catch (error) {
    logger.error('Error marking issue as spam', {
      error: error.message,
      issueId: req.params.id
    })
    return fail(res, 500, 'Failed to mark issue as spam')
  }
}

/**
 * Get list of departments
 */
export const getDepartments = async (req, res) => {
  try {
    const departments = await prisma.department.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        code: true,
        description: true,
        _count: {
          select: {
            issues: {
              where: {
                status: { in: ['PENDING', 'TRIAGED', 'ASSIGNED_TO_STAFF', 'IN_PROGRESS'] }
              }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    })

    return ok(res, departments)

  } catch (error) {
    logger.error('Error fetching departments', {
      error: error.message
    })
    return fail(res, 500, 'Failed to fetch departments')
  }
}

/**
 * Get moderator performance metrics
 */
export const getModeratorPerformance = async (req, res) => {
  try {
    const moderatorId = req.user.id
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const startOfWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

    const [
      todayCount,
      weekCount,
      monthCount,
      totalReviewed,
      avgReviewTime,
      approvalStats,
      categoryDistribution
    ] = await Promise.all([
      // Today's reviews
      prisma.issue.count({
        where: {
          moderatorId,
          moderatedAt: { gte: startOfDay }
        }
      }),

      // This week
      prisma.issue.count({
        where: {
          moderatorId,
          moderatedAt: { gte: startOfWeek }
        }
      }),

      // This month
      prisma.issue.count({
        where: {
          moderatorId,
          moderatedAt: { gte: startOfMonth }
        }
      }),

      // Total reviewed
      prisma.issue.count({
        where: { moderatorId }
      }),

      // Calculate average review time from actual moderated issues
      prisma.issue.aggregate({
        where: {
          moderatorId,
          moderatedAt: { not: null },
          createdAt: { not: null }
        },
        _avg: {
          // We'll need to calculate this in the application since Prisma doesn't support 
          // date difference aggregation directly
        }
      }).then(async () => {
        // Get actual review times
        const moderatedIssues = await prisma.issue.findMany({
          where: {
            moderatorId,
            moderatedAt: { not: null },
            createdAt: { not: null }
          },
          select: {
            createdAt: true,
            moderatedAt: true
          }
        })
        
        if (moderatedIssues.length === 0) return 0
        
        const totalReviewTime = moderatedIssues.reduce((sum, issue) => {
          const diffMs = new Date(issue.moderatedAt).getTime() - new Date(issue.createdAt).getTime()
          const diffHours = diffMs / (1000 * 60 * 60)
          return sum + diffHours
        }, 0)
        
        return totalReviewTime / moderatedIssues.length
      }),

      // Approval statistics
      prisma.issue.groupBy({
        by: ['moderationStatus'],
        where: { moderatorId },
        _count: { _all: true }
      }),

      // Category distribution
      prisma.issue.groupBy({
        by: ['categoryId'],
        where: {
          moderatorId,
          categoryId: { not: null }
        },
        _count: { _all: true },
        take: 5
      })
    ])

    const approved = approvalStats.find(s => s.moderationStatus === 'APPROVED')?._count._all || 0
    const rejected = approvalStats.find(s => s.moderationStatus === 'REJECTED')?._count._all || 0
    const spam = approvalStats.find(s => s.moderationStatus === 'SPAM_FLAGGED')?._count._all || 0

    const approvalRate = totalReviewed > 0 ? Math.round((approved / totalReviewed) * 100) : 0
    const qualityScore = Math.min(100, Math.round(approvalRate * 0.7 + (100 - (spam / Math.max(totalReviewed, 1)) * 100) * 0.3))

    return ok(res, {
      reviews: {
        today: todayCount,
        week: weekCount,
        month: monthCount,
        total: totalReviewed
      },
      performance: {
        avgReviewTime,
        approvalRate,
        qualityScore
      },
      breakdown: {
        approved,
        rejected,
        spam,
        needsInfo: approvalStats.find(s => s.moderationStatus === 'NEEDS_MORE_INFO')?._count._all || 0
      },
      topCategories: categoryDistribution
    })

  } catch (error) {
    logger.error('Error fetching moderator performance', {
      error: error.message,
      moderatorId: req.user.id
    })
    return fail(res, 500, 'Failed to fetch performance metrics')
  }
}

/**
 * Check for duplicate issues
 */
export const checkDuplicates = async (req, res) => {
  try {
    const { id } = req.params

    const issue = await prisma.issue.findUnique({
      where: { id },
      select: {
        title: true,
        description: true,
        latitude: true,
        longitude: true,
        categoryId: true,
        createdAt: true
      }
    })

    if (!issue) {
      return fail(res, 404, 'Issue not found')
    }

    // Find potential duplicates based on:
    // 1. Similar title (simple text matching)
    // 2. Same category
    // 3. Similar location (within 100 meters)
    // 4. Created within last 30 days

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    // Simple duplicate check (can be enhanced with fuzzy matching)
    const titleWords = issue.title.toLowerCase().split(' ').filter(w => w.length > 3)
    
    const potentialDuplicates = await prisma.issue.findMany({
      where: {
        id: { not: id },
        categoryId: issue.categoryId,
        createdAt: { gte: thirtyDaysAgo },
        status: { notIn: ['REJECTED', 'SPAM'] }
      },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        latitude: true,
        longitude: true,
        createdAt: true,
        reporter: {
          select: { name: true }
        }
      },
      take: 10
    })

    // Filter by title similarity and location proximity
    const duplicates = potentialDuplicates.filter(dup => {
      // Check title similarity
      const dupTitleLower = dup.title.toLowerCase()
      const matchingWords = titleWords.filter(word => dupTitleLower.includes(word))
      const titleSimilarity = matchingWords.length / Math.max(titleWords.length, 1)

      // Check location proximity (if coordinates available)
      let locationMatch = false
      if (issue.latitude && issue.longitude && dup.latitude && dup.longitude) {
        const distance = calculateDistance(
          issue.latitude, issue.longitude,
          dup.latitude, dup.longitude
        )
        locationMatch = distance < 0.1 // Within 100 meters
      }

      return titleSimilarity > 0.5 || locationMatch
    })

    return ok(res, {
      hasDuplicates: duplicates.length > 0,
      duplicates: duplicates.map(d => ({
        id: d.id,
        title: d.title,
        status: d.status,
        reporter: d.reporter?.name || 'Anonymous',
        createdAt: d.createdAt
      }))
    })

  } catch (error) {
    logger.error('Error checking duplicates', {
      error: error.message,
      issueId: req.params.id
    })
    return fail(res, 500, 'Failed to check for duplicates')
  }
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371 // Earth's radius in km
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c // Distance in km
}

function toRad(degrees) {
  return degrees * (Math.PI / 180)
}

/**
 * Get review history for a moderator
 */
export const getModeratorHistory = async (req, res) => {
  try {
    const moderatorId = req.user.id
    
    // Pagination params
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20
    const skip = (page - 1) * limit

    const history = await prisma.issue.findMany({
      where: {
        moderatorId,
        moderatedAt: { not: null }
      },
      select: {
        id: true,
        title: true,
        description: true,
        moderationStatus: true,
        status: true,
        moderatedAt: true,
        moderatorNotes: true,
        address: true,
        reporter: {
          select: { name: true }
        },
        category: {
          select: { name: true }
        }
      },
      orderBy: {
        moderatedAt: 'desc'
      },
      skip,
      take: limit
    })

    const transformedHistory = history.map(item => ({
      id: item.id,
      title: item.title,
      description: item.description,
      status: item.moderationStatus.toLowerCase(),
      reviewedAt: item.moderatedAt,
      reviewedBy: req.user.name || 'Moderator',
      decision: item.moderationStatus.toLowerCase(),
      reason: item.moderatorNotes,
      reporterName: item.reporter?.name || 'Anonymous',
      address: item.address || 'Unknown Location',
      categoryName: item.category?.name || 'Uncategorized'
    }))

    const total = await prisma.issue.count({
      where: {
        moderatorId,
        moderatedAt: { not: null }
      }
    })

    return ok(res, {
      history: transformedHistory,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    logger.error('Error fetching moderator history', {
      error: error.message,
      moderatorId: req.user.id
    })
    return fail(res, 500, 'Failed to fetch moderator history')
  }
}

/**
 * Update global announcements
 */
export const updateAnnouncements = async (req, res) => {
  try {
    const { announcements } = req.body;
    
    if (!Array.isArray(announcements)) {
      return fail(res, 400, 'Announcements must be an array of strings');
    }

    const jsonString = JSON.stringify(announcements);

    // Upsert the system setting
    await prisma.systemSetting.upsert({
      where: { key: 'announcements' },
      update: { value: jsonString },
      create: { key: 'announcements', value: jsonString }
    });

    try {
      const io = req.app.get('io')
      io.emit('system:announcements', announcements)
    } catch (error) {
      logger.warn('Failed to emit socket events for announcements', {
        error: error.message
      })
    }

    logger.info('Global announcements updated by moderator', {
      moderatorId: req.user.id,
      count: announcements.length
    });

    return ok(res, { message: 'Announcements updated successfully', announcements });
  } catch (error) {
    logger.error('Error updating announcements', {
      error: error.message,
      moderatorId: req.user.id
    });
    return fail(res, 500, 'Failed to update announcements');
  }
}
