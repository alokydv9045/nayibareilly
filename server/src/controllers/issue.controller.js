import { validationResult } from 'express-validator'
import prisma from '../config/prisma.js'
import { ok, created, fail } from '../utils/apiResponse.js'
import { emitDepartmentStats } from '../utils/realtime.js'
import storageService from '../services/storage.service.js'
import * as notificationService from '../services/notificationService.js'
import { logger } from '../utils/logger.js'

const makeReportId = () => 'REP-' + Math.random().toString(36).slice(2, 8).toUpperCase()

const resolveCategoryByName = async (nameRaw) => {
  if (!nameRaw) return null
  const name = String(nameRaw).trim()
  if (!name) return null
  const existing = await prisma.issueCategory.findUnique({ where: { name } })
  if (existing) return existing.id
  const createdCat = await prisma.issueCategory.create({ data: { name, color: '#9CA3AF', icon: 'more-horizontal', description: '' } })
  return createdCat.id
}

export const createIssue = async (req, res) => {
  let uploadedMediaRefs = []
  try {
    // Input validation
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array())
      return fail(res, 400, 'Invalid input: ' + errors.array().map(e => e.msg).join(', '), errors.array())
    }

    const { title, description, category, location, categoryName } = req.body
    const files = Array.isArray(req.files)
      ? req.files
      : Array.isArray(req.files?.images)
        ? req.files.images
        : []

    // Validate required fields
    if (!title || !description) {
      return fail(res, 400, 'Title and description are required')
    }

    // Validate title and description length
    if (title.length > 200) {
      return fail(res, 400, 'Title must be less than 200 characters')
    }

    if (description.length > 5000) {
      return fail(res, 400, 'Description must be less than 5000 characters')
    }

    // Parse and validate location data
    let loc = location
    if (typeof loc === 'string') {
      try { 
        loc = JSON.parse(loc) 
      } catch (error) { 
        return fail(res, 400, 'Invalid location format')
      }
    }

    // Validate location coordinates if provided
    if (loc && typeof loc === 'object') {
      if (loc.latitude && (loc.latitude < -90 || loc.latitude > 90)) {
        return fail(res, 400, 'Invalid latitude value')
      }
      if (loc.longitude && (loc.longitude < -180 || loc.longitude > 180)) {
        return fail(res, 400, 'Invalid longitude value')
      }
    }

    // Separate audio files from other files
    const audioFiles = files.filter(file => file.mimetype && file.mimetype.startsWith('audio/'))
    const imageFiles = files.filter(file => file.mimetype && file.mimetype.startsWith('image/'))
    const otherFiles = files.filter(file => !file.mimetype || (!file.mimetype.startsWith('audio/') && !file.mimetype.startsWith('image/')))

    // Validate file uploads
    const maxFileSize = 10 * 1024 * 1024 // 10MB
    const maxAudioSize = 5 * 1024 * 1024 // 5MB for audio
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    const allowedAudioTypes = ['audio/webm', 'audio/mp4', 'audio/mpeg', 'audio/wav']
    const maxFiles = 5

    if (files.length > maxFiles) {
      return fail(res, 400, `Maximum ${maxFiles} files allowed`)
    }

    // Validate image files
    for (const file of imageFiles) {
      if (file.size > maxFileSize) {
        return fail(res, 400, 'Image file size must be less than 10MB')
      }
      if (!allowedImageTypes.includes(file.mimetype)) {
        return fail(res, 400, 'Only image files (JPEG, PNG, GIF, WebP) are allowed')
      }
    }

    // Validate audio files
    for (const file of audioFiles) {
      if (file.size > maxAudioSize) {
        return fail(res, 400, 'Audio file size must be less than 5MB')
      }
      if (!allowedAudioTypes.includes(file.mimetype)) {
        return fail(res, 400, 'Only audio files (WebM, MP4, MP3, WAV) are allowed')
      }
    }

    // Reject other file types
    if (otherFiles.length > 0) {
      return fail(res, 400, 'Only image and audio files are allowed')
    }

    // Resolve or create category
    let categoryId = null
    
    // If category is provided as a string name, resolve it
    if (category && typeof category === 'string' && isNaN(parseInt(category))) {
      categoryId = await resolveCategoryByName(category)
    } 
    // If category is provided as a number ID, use it directly
    else if (category && !isNaN(parseInt(category))) {
      categoryId = parseInt(category)
    }
    // Otherwise, try categoryName if provided
    else if (categoryName) {
      categoryId = await resolveCategoryByName(categoryName)
    }

    // Validate category exists if provided
    if (categoryId) {
      const categoryExists = await prisma.issueCategory.findUnique({
        where: { id: categoryId, isActive: true }
      })
      if (!categoryExists) {
        return fail(res, 400, 'Invalid category selected')
      }
    }

    // Generate unique report ID
    const reportId = makeReportId()

    if (files.length) {
      try {
        uploadedMediaRefs = await storageService.uploadIssueMedia(files, { folder: `issues/${reportId}/submitted` })
      } catch (storageError) {
        console.error('Issue media upload failed:', storageError)
        return fail(res, 500, 'Failed to upload attachments')
      }
    }

    const mediaData = uploadedMediaRefs.map((item) => ({
      url: item.url,
      filename: item.key,
      originalName: item.originalName,
      mimeType: item.mimeType,
      size: item.size
    }))

    // Get user information for issue creation
    const reporterId = req.user?.id || null
    const reporterName = req.user?.name || 'Anonymous'
    const reporterEmail = req.user?.email || ''

    // Create issue with transaction for data integrity
    const issue = await prisma.$transaction(async (tx) => {
      const newIssue = await tx.issue.create({
        data: {
          title: title.trim(),
          description: description.trim(),
          categoryId: categoryId || undefined,
          reporterId,
          reporterName,
          reporterEmail,
          latitude: loc && typeof loc === 'object' ? loc.latitude ?? null : null,
          longitude: loc && typeof loc === 'object' ? loc.longitude ?? null : null,
          address: loc && typeof loc === 'object' ? (loc.address || null) : null,
          landmark: loc && typeof loc === 'object' ? (loc.landmark || null) : null,
          ward: loc && typeof loc === 'object' ? (loc.ward || null) : null,
          zone: loc && typeof loc === 'object' ? (loc.zone || null) : null,
          reportId,
          status: 'PENDING',
          priority: 'MEDIUM',
          isAnonymous: !reporterId,
          isPublic: true,
          viewCount: 0,
          upvotes: 0,
          downvotes: 0,
          totalVotes: 0,
          timeline: { 
            create: [{ 
              status: 'PENDING', 
              note: 'Issue created and submitted for review', 
              performedById: reporterId 
            }] 
          },
          images: { create: mediaData }
        },
        include: { 
          images: true,
          category: true,
          timeline: {
            include: { performedBy: { select: { name: true } } },
            orderBy: { createdAt: 'desc' }
          }
        }
      })

      // Create activity log
      await tx.activityLog.create({
        data: {
          action: 'CREATED',
          description: `Issue "${title.trim()}" created`,
          userId: reporterId,
          issueId: newIssue.id,
          metadata: {
            reportId,
            category: categoryId ? 'categorized' : 'uncategorized',
            hasLocation: !!(loc && loc.latitude && loc.longitude),
            hasImages: files.length > 0,
            isAnonymous: !reporterId
          },
          ipAddress: req.ip || req.connection?.remoteAddress,
          userAgent: req.get('User-Agent')
        }
      })

      return newIssue
    })

    // Send notification to reporter if authenticated
    if (issue.reporterId) {
      try {
        await prisma.notification.create({ 
          data: { 
            userId: issue.reporterId, 
            title: 'Issue submitted successfully', 
            message: `Your report "${issue.title}" has been created and is being reviewed.`, 
            type: 'issue_created',
            metadata: { issueId: issue.id, reportId: issue.reportId }
          } 
        })
        
        // Real-time notification
        try { 
          req.app.get('io').to(`user:${issue.reporterId}`).emit('notification:new', { 
            title: 'Issue submitted successfully',
            issueId: issue.id,
            reportId: issue.reportId
          }) 
        } catch (ioError) {
          console.warn('Failed to send real-time notification:', ioError.message)
        }
      } catch (notificationError) {
        console.warn('Failed to create notification:', notificationError.message)
      }
    }

    // Emit public real-time event for new issue creation
    try {
      const io = req.app.get('io')
      io.emit('public:issue:created', {
        id: issue.id,
        reportId: issue.reportId,
        title: issue.title,
        categoryName: issue.category?.name || categoryName || 'Uncategorized',
        status: issue.status,
        createdAt: issue.createdAt
      })
      
      // Also emit stats update event
      const [totalIssues, resolvedIssues] = await Promise.all([
        prisma.issue.count({ where: { moderationStatus: 'APPROVED' } }),
        prisma.issue.count({ where: { moderationStatus: 'APPROVED', status: 'RESOLVED' } })
      ])
      
      io.emit('public:stats:update', {
        totalIssues,
        resolvedIssues,
        timestamp: new Date().toISOString()
      })
    } catch (ioError) {
      console.warn('Failed to emit public real-time events:', ioError.message)
    }

    // Broadcast new issue to administrators
    try { 
      req.app.get('io').emit('issue:new', { 
        id: issue.id, 
        title: issue.title,
        reportId: issue.reportId,
        category: issue.category?.name,
        priority: issue.priority,
        createdAt: issue.createdAt
      }) 
    } catch (ioError) {
      console.warn('Failed to broadcast new issue:', ioError.message)
    }

    // Return created issue with complete data
    created(res, { 
      issue,
      message: 'Issue created successfully and is under review'
    })

  } catch (error) {
    if (uploadedMediaRefs.length) {
      try {
        await storageService.deleteKeys(uploadedMediaRefs.map((item) => item.key))
      } catch (cleanupError) {
        console.warn('Failed to clean up uploaded media after creation error:', cleanupError.message)
      }
    }
    console.error('Issue creation error:', error)
    
    // Handle specific database errors
    if (error.code === 'P2002') {
      return fail(res, 409, 'Issue with this report ID already exists')
    }
    
    return fail(res, 500, 'Failed to create issue. Please try again.')
  }
}

export const listIssues = async (req, res) => {
  try {
    // Parse and validate query parameters
    const { 
      page = 1, 
      limit = 10, 
  status, 
  moderationStatus,
      q, 
      category, 
      user, 
      assignedTo, 
      department, 
      priority,
      sort = 'newest',
      startDate,
      endDate
    } = req.query

    // Validate pagination parameters
    const pageNum = Math.max(1, parseInt(page, 10) || 1)
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10)) // Cap at 100

    // Build where clause with proper validation
    const where = {}

    // Status filter with validation
    if (status) {
      const validStatuses = [
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
        'CITIZEN_VERIFIED',
        'RESOLVED',
        'CLOSED',
        'ESCALATED',
        'REJECTED',
        'NEEDS_MORE_INFO',
        'SPAM'
      ]
      const statusValue = String(status).toUpperCase()
      if (validStatuses.includes(statusValue)) {
        where.status = statusValue
      } else {
        return fail(res, 400, 'Invalid status value')
      }
    }

    // Moderation status filter
    if (moderationStatus) {
      const valid = ['PENDING_REVIEW','UNDER_REVIEW','APPROVED','REJECTED','NEEDS_MORE_INFO','SPAM_FLAGGED']
      const val = String(moderationStatus).toUpperCase()
      if (valid.includes(val)) {
        where.moderationStatus = val
      } else {
        return fail(res, 400, 'Invalid moderationStatus value')
      }
    }

    // Priority filter with validation
    if (priority) {
      const validPriorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
      const priorityValue = String(priority).toUpperCase()
      if (validPriorities.includes(priorityValue)) {
        where.priority = priorityValue
      } else {
        return fail(res, 400, 'Invalid priority value')
      }
    }

    // Category filter with validation
    if (category) {
      // Validate that category exists
      const categoryExists = await prisma.issueCategory.findUnique({
        where: { id: String(category) }
      })
      if (categoryExists) {
        where.categoryId = String(category)
      } else {
        return fail(res, 400, 'Invalid category')
      }
    }

    // User filters with validation
    if (user) {
      where.reporterId = String(user)
    }

    if (assignedTo === 'me' && req.user?.id) {
      where.assignedToId = req.user.id
    } else if (assignedTo && assignedTo !== 'me') {
      where.assignedToId = String(assignedTo)
    }

    // Department filter with validation
    if (department) {
      const departmentExists = await prisma.department.findUnique({
        where: { id: String(department) }
      })
      if (departmentExists) {
        where.departmentId = String(department)
      } else {
        return fail(res, 400, 'Invalid department')
      }
    }

    // Date range filter
    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) {
        const start = new Date(startDate)
        if (isNaN(start.getTime())) {
          return fail(res, 400, 'Invalid start date format')
        }
        where.createdAt.gte = start
      }
      if (endDate) {
        const end = new Date(endDate)
        if (isNaN(end.getTime())) {
          return fail(res, 400, 'Invalid end date format')
        }
        where.createdAt.lte = end
      }
    }

    // Search filter with proper text search
    if (q) {
      const searchTerm = String(q).trim()
      if (searchTerm.length < 2) {
        return fail(res, 400, 'Search term must be at least 2 characters')
      }
      
      where.OR = [
        { title: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
        { address: { contains: searchTerm, mode: 'insensitive' } },
        { reportId: { contains: searchTerm, mode: 'insensitive' } }
      ]
    }

    // Build orderBy clause with validation
    const orderBy = (() => {
      switch (sort) {
        case 'votes':
          return [{ totalVotes: 'desc' }, { createdAt: 'desc' }]
        case 'oldest':
          return [{ createdAt: 'asc' }]
        case 'priority':
          return [
            { priority: 'desc' }, // CRITICAL, HIGH, MEDIUM, LOW
            { createdAt: 'desc' }
          ]
        case 'updated':
          return [{ updatedAt: 'desc' }]
        case 'status':
          return [{ status: 'asc' }, { createdAt: 'desc' }]
        case 'newest':
        default:
          return [{ createdAt: 'desc' }]
      }
    })()

    // Calculate pagination
    const skip = (pageNum - 1) * limitNum
    const take = limitNum

    // Execute queries with optimized selection
    const [items, total] = await Promise.all([
      prisma.issue.findMany({
        where,
        orderBy,
        skip,
        take,
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          priority: true,
          reportId: true,
          createdAt: true,
          updatedAt: true,
          resolvedAt: true,
          totalVotes: true,
          upvotes: true,
          downvotes: true,
          viewCount: true,
          isEscalated: true,
          slaBreached: true,
          latitude: true,
          longitude: true,
          address: true,
          reporterName: true,
          isAnonymous: true,
          category: { 
            select: { 
              id: true, 
              name: true, 
              color: true, 
              icon: true 
            } 
          },
          department: {
            select: {
              id: true,
              name: true,
              code: true
            }
          },
          assignedTo: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          images: { 
            select: { 
              id: true,
              url: true,
              filename: true
            }, 
            take: 3 // Limit images for list view
          },
          _count: {
            select: {
              comments: true,
              timeline: true
            }
          }
        }
      }),
      prisma.issue.count({ where })
    ])

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limitNum)
    const hasNextPage = pageNum < totalPages
    const hasPrevPage = pageNum > 1

    // Return results with metadata
    ok(res, {
      items,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: totalPages,
        hasNextPage,
        hasPrevPage
      },
      filters: {
        status: status || null,
        priority: priority || null,
        category: category || null,
        assignedTo: assignedTo || null,
        department: department || null,
        search: q || null,
        sort,
        startDate: startDate || null,
        endDate: endDate || null
      }
    })

  } catch (error) {
    console.error('List issues error:', error)
    return fail(res, 500, 'Failed to fetch issues. Please try again.')
  }
}

export const getIssue = async (req, res) => {
  const issue = await prisma.issue.findUnique({
    where: { id: req.params.id },
    include: { category: true, images: true, reporter: { select: { id: true, name: true, email: true } }, timeline: { orderBy: { createdAt: 'asc' } } }
  })
  if (!issue) return fail(res, 404, 'Issue not found')
  ok(res, { issue })
}

export const getIssueByReportId = async (req, res) => {
  const { reportId } = req.params
  const issue = await prisma.issue.findUnique({
    where: { reportId },
    select: { id: true, title: true, status: true, reportId: true, createdAt: true, updatedAt: true, category: { select: { id: true, name: true, color: true, icon: true } }, timeline: true }
  })
  if (!issue) return fail(res, 404, 'Issue not found')
  ok(res, { issue })
}

export const updateIssue = async (req, res) => {
  const updates = req.body
  if (updates.status) delete updates.status
  const issue = await prisma.issue.update({ where: { id: req.params.id }, data: updates })
  if (!issue) return fail(res, 404, 'Issue not found')
  try { 
    const io = req.app.get('io')
    io.emit('issue:update', { id: issue.id, status: issue.status })
    if (issue.departmentId) emitDepartmentStats(io, issue.departmentId)
  } catch (error) {
    logger.warn('Failed to emit socket event for issue update', {
      event: 'issue:update',
      issueId: issue.id,
      error: error.message
    })
  }
  ok(res, { issue })
}

export const voteIssue = async (req, res) => {
  const issueId = req.params.id
  try {
    await prisma.vote.create({ data: { userId: req.user.id, issueId, isUpvote: true } })
  } catch (e) {
    // Unique constraint violation => already voted
    if (e && e.code === 'P2002') return fail(res, 400, 'Already voted')
    throw e
  }
  const updated = await prisma.issue.update({ where: { id: issueId }, data: { upvotes: { increment: 1 }, totalVotes: { increment: 1 } }, select: { upvotes: true, totalVotes: true, id: true } })
  try { 
    req.app.get('io').emit('issue:vote', { id: updated.id, votes: updated.totalVotes }) 
  } catch (error) {
    logger.warn('Failed to emit socket event for vote', {
      event: 'issue:vote',
      issueId: updated.id,
      error: error.message
    })
  }
  ok(res, { votes: updated.totalVotes })
}

export const getVoteStatus = async (req, res) => {
  const issueId = req.params.id
  const count = await prisma.vote.count({ where: { userId: req.user.id, issueId } })
  ok(res, { hasVoted: count > 0 })
}

export const myIssues = async (req, res) => {
  try {
    const userId = req.user.id
    const limit = parseInt(req.query.limit) || 10
    const page = parseInt(req.query.page) || 1
    const skip = (page - 1) * limit

    const [issues, total] = await Promise.all([
      prisma.issue.findMany({
        where: { reporterId: userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          priority: true,
          createdAt: true,
          updatedAt: true,
          viewCount: true,
          reportId: true,
          category: {
            select: {
              id: true,
              name: true
            }
          },
          _count: {
            select: {
              votes: true
            }
          }
        }
      }),
      prisma.issue.count({ where: { reporterId: userId } })
    ])

    const items = issues.map(issue => ({
      id: issue.id,
      title: issue.title,
      status: issue.status.toLowerCase(),
      category: issue.category?.name || 'Uncategorized',
      createdAt: issue.createdAt.toISOString(),
      priority: issue.priority.toLowerCase(),
      votes: issue._count.votes,
      views: issue.viewCount,
      reportId: issue.reportId
    }))

    const totalPages = Math.ceil(total / limit)
    
    return ok(res, {
      items,
      pagination: {
        total,
        page,
        limit,
        pages: totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    })
  } catch (error) {
    console.error('Error fetching user issues:', error)
    return fail(res, 500, 'Failed to fetch your issues')
  }
}

export const updateStatus = async (req, res) => {
  const { status, note } = req.body
  if (!status) return fail(res, 400, 'status is required')
  const statusEnum = String(status).toUpperCase()
  
  // Get the old status before updating
  const oldIssue = await prisma.issue.findUnique({
    where: { id: req.params.id },
    select: { status: true }
  })
  
  const issue = await prisma.issue.update({
    where: { id: req.params.id },
    data: {
      status: statusEnum,
      timeline: { create: [{ status: statusEnum, note: note || null, performedById: req.user?.id || null }] }
    },
    include: { timeline: true }
  })
  
  // Notify reporter of status change using new notification service
  if (issue.reporterId && oldIssue.status !== statusEnum) {
    try {
      await notificationService.notifyIssueStatusChange(
        issue.id,
        statusEnum,
        req.user?.id
      )
    } catch (error) {
      logger.error('Failed to create notification for status update', {
        issueId: issue.id,
        reporterId: issue.reporterId,
        error: error.message
      })
    }
  }
  
  try { 
    const io = req.app.get('io')
    io.emit('issue:status', { id: issue.id, status: issue.status })
    if (issue.departmentId) emitDepartmentStats(io, issue.departmentId)
    
    // Emit public stats update if status changed to resolved
    if (statusEnum === 'RESOLVED' && issue.moderationStatus === 'APPROVED') {
      const [totalIssues, resolvedIssues] = await Promise.all([
        prisma.issue.count({ where: { moderationStatus: 'APPROVED' } }),
        prisma.issue.count({ where: { moderationStatus: 'APPROVED', status: 'RESOLVED' } })
      ])
      io.emit('public:stats:update', {
        totalIssues,
        resolvedIssues,
        timestamp: new Date().toISOString()
      })
    }
  } catch (error) {
    logger.warn('Failed to emit issue status socket events', {
      event: 'issue:status',
      issueId: issue.id,
      error: error.message
    })
  }
  ok(res, { issue })
}

// New workflow-specific endpoints
export const triageIssue = async (req, res) => {
  const { departmentId, note } = req.body
  if (!departmentId) return fail(res, 400, 'departmentId is required')
  const issue = await prisma.issue.update({
    where: { id: req.params.id },
    data: {
      departmentId,
      status: 'TRIAGED',
      moderationStatus: 'APPROVED',
      timeline: { create: [{ status: 'TRIAGED', note: note || 'Assigned to department', performedById: req.user?.id || null }] }
    },
    include: { timeline: true }
  })
  try { 
    const io = req.app.get('io')
    io.emit('issue:status', { id: issue.id, status: issue.status })
    if (issue.departmentId) emitDepartmentStats(io, issue.departmentId)
  } catch (error) {
    logger.warn('Failed to emit triage socket events', {
      event: 'issue:status',
      issueId: issue.id,
      error: error.message
    })
  }
  ok(res, { issue })
}

// NOTE: assignToStaff has been moved to department.controller.js
// Staff assignment should only be done by department admins through department routes

export const startWork = async (req, res) => {
  // Only assigned staff can start
  const issue = await prisma.issue.findUnique({ where: { id: req.params.id }, select: { id: true, assignedToId: true } })
  if (!issue) return fail(res, 404, 'Issue not found')
  if (issue.assignedToId !== req.user?.id) return fail(res, 403, 'Only assigned staff can start work')
  const updated = await prisma.issue.update({
    where: { id: issue.id },
    data: {
      status: 'IN_PROGRESS',
      timeline: { create: [{ status: 'IN_PROGRESS', note: 'Work started', performedById: req.user?.id || null }] }
    },
    include: { timeline: true }
  })
  try { 
    const io = req.app.get('io')
    io.emit('issue:status', { id: updated.id, status: updated.status })
    if (updated.departmentId) emitDepartmentStats(io, updated.departmentId)
  } catch (error) {
    logger.warn('Failed to emit start work socket events', {
      event: 'issue:status',
      issueId: updated.id,
      error: error.message
    })
  }
  ok(res, { issue: updated })
}

export const resolveIssue = async (req, res) => {
  const files = Array.isArray(req.files)
    ? req.files
    : Array.isArray(req.files?.after)
      ? req.files.after
      : []
  if (!files.length) return fail(res, 400, 'After photo is required to resolve')
  
  // Get issue to calculate resolution time
  const existingIssue = await prisma.issue.findUnique({
    where: { id: req.params.id },
    select: { 
      id: true, 
      createdAt: true, 
      assignedToId: true,
      reporterId: true 
    }
  })
  
  if (!existingIssue) return fail(res, 404, 'Issue not found')
  
  // Calculate resolution time in hours
  const now = new Date()
  const resolutionTimeMs = now.getTime() - existingIssue.createdAt.getTime()
  const resolutionTimeHours = Math.round((resolutionTimeMs / (1000 * 60 * 60)) * 100) / 100
  
  let uploadedMediaRefs = []
  try {
    uploadedMediaRefs = await storageService.uploadIssueMedia(files, { folder: `issues/${existingIssue.id}/resolved` })
  } catch (storageError) {
    console.error('Resolution media upload failed:', storageError)
    return fail(res, 500, 'Failed to upload resolution photos')
  }

  const mediaData = uploadedMediaRefs.map((item) => ({
    url: item.url,
    filename: item.key,
    originalName: item.originalName,
    mimeType: item.mimeType,
    size: item.size
  }))
  
  let issue
  try {
    issue = await prisma.issue.update({
      where: { id: req.params.id },
      data: {
        status: 'RESOLVED',
        resolvedAt: now,
        resolvedById: req.user?.id || null,
        resolutionTimeHours: resolutionTimeHours,
        images: { create: mediaData },
        timeline: { 
          create: [{ 
            status: 'RESOLVED', 
            note: `Work completed with proof (Resolution time: ${resolutionTimeHours}h)`, 
            performedById: req.user?.id || null 
          }] 
        }
      },
      include: { images: true, timeline: true }
    })
  } catch (error) {
    if (uploadedMediaRefs.length) {
      try {
        await storageService.deleteKeys(uploadedMediaRefs.map((item) => item.key))
      } catch (cleanupError) {
        console.warn('Failed to clean up uploaded media after resolve error:', cleanupError.message)
      }
    }
    console.error('Resolve issue update failed:', error)
    return fail(res, 500, 'Failed to resolve issue. Please try again.')
  }
  
  // Notify reporter
  if (issue.reporterId) {
    try {
      await prisma.notification.create({
        data: {
          userId: issue.reporterId,
          title: 'Issue Resolved',
          message: `Your issue has been resolved. Resolution time: ${resolutionTimeHours} hours.`,
          type: 'issue_resolved',
          metadata: { issueId: issue.id, resolutionTimeHours }
        }
      })
      
      try {
        req.app.get('io').to(`user:${issue.reporterId}`).emit('notification:new', {
          title: 'Issue Resolved',
          issueId: issue.id
        })
      } catch (error) {
        logger.warn('Failed to emit resolution notification socket event', {
          event: 'notification:new',
          userId: issue.reporterId,
          issueId: issue.id,
          error: error.message
        })
      }
    } catch (err) {
      console.warn('Failed to send resolution notification:', err.message)
    }
  }
  
  try { 
    const io = req.app.get('io')
    io.emit('issue:status', { 
      id: issue.id, 
      status: issue.status,
      resolutionTimeHours 
    })
    if (issue.departmentId) emitDepartmentStats(io, issue.departmentId)
  } catch (error) {
    logger.warn('Failed to emit resolution socket events', {
      event: 'issue:status',
      issueId: issue.id,
      error: error.message
    })
  }
  
  ok(res, { issue })
}

export const closeIssue = async (req, res) => {
  const { note } = req.body
  const issue = await prisma.issue.update({
    where: { id: req.params.id },
    data: {
      status: 'CLOSED',
      timeline: { create: [{ status: 'CLOSED', note: note || 'Closed', performedById: req.user?.id || null }] }
    },
    include: { timeline: true }
  })
  try { 
    req.app.get('io').emit('issue:status', { id: issue.id, status: issue.status }) 
  } catch (error) {
    logger.warn('Failed to emit close issue socket event', {
      event: 'issue:status',
      issueId: issue.id,
      error: error.message
    })
  }
  ok(res, { issue })
}

// Public categories listing for filters
export const listCategoriesPublic = async (req, res) => {
  const items = await prisma.issueCategory.findMany({ orderBy: { name: 'asc' } })
  res.set('Cache-Control', 'public, max-age=60, s-maxage=300')
  ok(res, { items })
}

export const addIssueComment = async (req, res) => {
  const issueId = req.params.id
  const { comment } = req.body
  if (!comment || String(comment).trim().length < 1) return fail(res, 400, 'comment is required')
  
  const createdComment = await prisma.issueComment.create({
    data: { issueId, userId: req.user?.id || null, content: String(comment).trim(), isInternal: false, isPublic: true }
  })
  
  // Emit socket event
  try { 
    req.app.get('io').emit('issue:comment', { id: issueId, commentId: createdComment.id }) 
  } catch (error) {
    logger.warn('Failed to emit comment socket event', {
      event: 'issue:comment',
      issueId,
      commentId: createdComment.id,
      error: error.message
    })
  }
  
  // Send notifications using new notification service
  try {
    await notificationService.notifyNewComment(
      issueId,
      createdComment.id,
      req.user?.id
    );
  } catch (error) {
    logger.error('Failed to create comment notification', {
      issueId,
      commentId: createdComment.id,
      error: error.message
    });
  }
  
  created(res, { comment: createdComment })
}

export const listAssignedToMe = async (req, res) => {
  if (!req.user?.id) return fail(res, 401, 'Unauthorized')
  const items = await prisma.issue.findMany({
    where: { assignedToId: req.user.id },
    orderBy: { updatedAt: 'desc' },
    select: { id: true, title: true, status: true, priority: true, address: true, latitude: true, longitude: true, createdAt: true, updatedAt: true }
  })
  ok(res, { items })
}

/**
 * Citizen verification of resolved issue
 * Allows citizen to verify issue resolution, provide rating and feedback
 */
export const verifyCitizenResolution = async (req, res) => {
  try {
    const { id: issueId } = req.params
    const { rating, feedback, reopen, reopenReason } = req.body
    const citizenId = req.user?.id

    if (!citizenId) {
      return fail(res, 401, 'Unauthorized - citizen login required')
    }

    // Validate rating (1-5 stars)
    if (rating && (rating < 1 || rating > 5)) {
      return fail(res, 400, 'Rating must be between 1 and 5')
    }

    // Get the issue
    const issue = await prisma.issue.findUnique({
      where: { id: issueId },
      include: {
        reporter: { select: { id: true, name: true, email: true } },
        assignedTo: { select: { id: true, name: true } },
        department: { select: { id: true, name: true } }
      }
    })

    if (!issue) {
      return fail(res, 404, 'Issue not found')
    }

    // Verify citizen is the reporter
    if (issue.reporterId !== citizenId) {
      return fail(res, 403, 'Only the issue reporter can verify resolution')
    }

    // Check if issue is in a verifiable state
    const verifiableStatuses = ['WORK_COMPLETED', 'PENDING_CITIZEN_VERIFICATION', 'RESOLVED']
    if (!verifiableStatuses.includes(issue.status)) {
      return fail(res, 400, `Issue cannot be verified in ${issue.status} status`)
    }

    // Handle reopen request
    if (reopen === true) {
      const updatedIssue = await prisma.issue.update({
        where: { id: issueId },
        data: {
          status: 'IN_PROGRESS',
          citizenFeedback: reopenReason || feedback || 'Citizen reopened - issue not resolved',
          citizenRating: rating || null,
          timeline: {
            create: {
              status: 'IN_PROGRESS',
              note: `Citizen reopened issue: ${reopenReason || 'Issue not satisfactorily resolved'}`,
              performedById: citizenId
            }
          }
        },
        include: {
          reporter: { select: { id: true, name: true, email: true } },
          assignedTo: { select: { id: true, name: true } },
          department: { select: { id: true, name: true } }
        }
      })

      // Notify assigned staff and department
      try {
        const io = req.app.get('io')
        io.emit('issue:status', { id: updatedIssue.id, status: 'IN_PROGRESS' })
        io.emit('issue:reopened', { 
          id: updatedIssue.id,
          reason: reopenReason || 'Citizen not satisfied'
        })

        if (updatedIssue.assignedToId) {
          io.to(`user:${updatedIssue.assignedToId}`).emit('issue:reopened', {
            id: updatedIssue.id,
            title: updatedIssue.title
          })
        }

        if (updatedIssue.departmentId) {
          emitDepartmentStats(io, updatedIssue.departmentId)
        }
      } catch (error) {
        logger.warn('Failed to emit reopen socket events', {
          error: error.message,
          issueId: updatedIssue.id
        })
      }

      return ok(res, { 
        issue: updatedIssue,
        message: 'Issue reopened successfully' 
      })
    }

    // Handle verification (positive feedback)
    const updatedIssue = await prisma.issue.update({
      where: { id: issueId },
      data: {
        status: 'CITIZEN_VERIFIED',
        citizenRating: rating || null,
        citizenFeedback: feedback || null,
        citizenVerifiedAt: new Date(),
        timeline: {
          create: {
            status: 'CITIZEN_VERIFIED',
            note: `Citizen verified resolution${rating ? ` with ${rating} stars` : ''}${feedback ? `: "${feedback}"` : ''}`,
            performedById: citizenId
          }
        }
      },
      include: {
        reporter: { select: { id: true, name: true, email: true } },
        assignedTo: { select: { id: true, name: true } },
        department: { select: { id: true, name: true } },
        category: { select: { id: true, name: true } }
      }
    })

    // Activity log
    await prisma.activityLog.create({
      data: {
        userId: citizenId,
        action: 'VERIFIED',
        issueId: updatedIssue.id,
        description: `Citizen verified issue resolution${rating ? ` with ${rating}/5 rating` : ''}`,
        metadata: { 
          rating: rating || null,
          feedback: feedback || null,
          departmentId: updatedIssue.departmentId
        }
      }
    })

    // Real-time notifications
    try {
      const io = req.app.get('io')
      
      // Update issue status
      io.emit('issue:status', { 
        id: updatedIssue.id, 
        status: 'CITIZEN_VERIFIED' 
      })

      // Notify assigned staff
      if (updatedIssue.assignedToId) {
        io.to(`user:${updatedIssue.assignedToId}`).emit('issue:verified', {
          id: updatedIssue.id,
          title: updatedIssue.title,
          rating: rating || null
        })
      }

      // Update department stats
      if (updatedIssue.departmentId) {
        emitDepartmentStats(io, updatedIssue.departmentId)
      }
    } catch (error) {
      logger.warn('Failed to emit verification socket events', {
        error: error.message,
        issueId: updatedIssue.id
      })
    }

    logger.info('Issue verified by citizen', {
      issueId: updatedIssue.id,
      citizenId,
      rating: rating || null,
      reopened: false
    })

    return ok(res, { 
      issue: updatedIssue,
      message: 'Issue verified successfully. Thank you for your feedback!' 
    })

  } catch (error) {
    logger.error('Error verifying issue resolution', {
      error: error.message,
      stack: error.stack,
      issueId: req.params.id
    })
    return fail(res, 500, 'Failed to verify issue resolution')
  }
}

/**
 * Check for duplicate issues near a location
 * Uses Haversine formula to calculate distance between coordinates
 * GET /api/issues/check-duplicates?lat=X&lng=Y&categoryId=Z&radius=500
 */
export const checkDuplicates = async (req, res) => {
  try {
    const { lat, lng, categoryId, radius = 500 } = req.query

    // Validate required parameters
    if (!lat || !lng) {
      return fail(res, 400, 'Latitude and longitude are required')
    }

    const latitude = parseFloat(lat)
    const longitude = parseFloat(lng)
    const searchRadius = parseInt(radius, 10)

    if (isNaN(latitude) || isNaN(longitude)) {
      return fail(res, 400, 'Invalid latitude or longitude')
    }

    if (latitude < -90 || latitude > 90) {
      return fail(res, 400, 'Latitude must be between -90 and 90')
    }

    if (longitude < -180 || longitude > 180) {
      return fail(res, 400, 'Longitude must be between -180 and 180')
    }

    if (isNaN(searchRadius) || searchRadius < 1 || searchRadius > 5000) {
      return fail(res, 400, 'Radius must be between 1 and 5000 meters')
    }

    // Calculate bounding box for efficient filtering
    // 1 degree latitude ≈ 111 km = 111,000 meters
    // 1 degree longitude ≈ 111 km * cos(latitude)
    const latDelta = (searchRadius / 111000)
    const lngDelta = (searchRadius / (111000 * Math.cos(latitude * Math.PI / 180)))

    const minLat = latitude - latDelta
    const maxLat = latitude + latDelta
    const minLng = longitude - lngDelta
    const maxLng = longitude + lngDelta

    // Build where clause
    const whereClause = {
      // Only check issues from the last 30 days
      createdAt: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      },
      // Exclude resolved and closed issues
      status: {
        notIn: ['RESOLVED', 'CITIZEN_VERIFIED', 'CLOSED']
      },
      // Filter by bounding box
      AND: [
        { latitude: { gte: minLat, lte: maxLat } },
        { longitude: { gte: minLng, lte: maxLng } }
      ]
    }

    // Add category filter if provided
    if (categoryId) {
      whereClause.categoryId = categoryId
    }

    // Fetch potential duplicates
    const potentialDuplicates = await prisma.issue.findMany({
      where: whereClause,
      select: {
        id: true,
        reportId: true,
        title: true,
        description: true,
        latitude: true,
        longitude: true,
        status: true,
        createdAt: true,
        totalVotes: true,
        category: {
          select: {
            id: true,
            name: true
          }
        },
        images: {
          select: {
            url: true
          },
          take: 1
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Haversine formula to calculate precise distance
    const haversineDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371000 // Earth's radius in meters
      const φ1 = lat1 * Math.PI / 180
      const φ2 = lat2 * Math.PI / 180
      const Δφ = (lat2 - lat1) * Math.PI / 180
      const Δλ = (lon2 - lon1) * Math.PI / 180

      const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

      return R * c // Distance in meters
    }

    // Filter by precise distance and add distance field
    const duplicates = potentialDuplicates
      .map(issue => {
        const distance = haversineDistance(
          latitude,
          longitude,
          issue.latitude,
          issue.longitude
        )
        return { ...issue, distance: Math.round(distance) }
      })
      .filter(issue => issue.distance <= searchRadius)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 10) // Limit to top 10 nearest

    logger.info('Duplicate check performed', {
      searchLocation: { latitude, longitude },
      radius: searchRadius,
      categoryId: categoryId || 'all',
      foundCount: duplicates.length
    })

    return ok(res, {
      duplicates,
      searchParams: {
        latitude,
        longitude,
        radius: searchRadius,
        categoryId: categoryId || null
      },
      message: duplicates.length > 0 
        ? `Found ${duplicates.length} similar issue(s) nearby`
        : 'No similar issues found nearby'
    })

  } catch (error) {
    logger.error('Error checking for duplicate issues', {
      error: error.message,
      stack: error.stack,
      query: req.query
    })
    return fail(res, 500, 'Failed to check for duplicates')
  }
}

/**
 * Get pending issues for moderator review
 * Optimized query specifically for moderation queue
 * GET /api/v1/moderator/pending
 */
export const getPendingIssues = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query

    const pageNum = Math.max(1, parseInt(page, 10) || 1)
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20))
    const skip = (pageNum - 1) * limitNum

    // Get issues pending moderation with optimized query
    const [issues, total] = await Promise.all([
      prisma.issue.findMany({
        where: {
          moderationStatus: 'PENDING_REVIEW'
        },
        include: {
          reporter: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true
            }
          },
          category: {
            select: {
              id: true,
              name: true,
              description: true
            }
          },
          images: {
            select: {
              id: true,
              url: true,
              filename: true,
              mimeType: true
            }
          },
          department: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: {
          createdAt: 'asc' // FIFO - oldest first
        },
        skip,
        take: limitNum
      }),
      prisma.issue.count({
        where: {
          moderationStatus: 'PENDING_REVIEW'
        }
      })
    ])

    // Format issues for frontend consumption
    const formattedIssues = issues.map(issue => ({
      id: issue.id,
      reportId: issue.reportId,
      title: issue.title,
      description: issue.description,
      reporterName: issue.reporterName,
      address: issue.address,
      latitude: issue.latitude,
      longitude: issue.longitude,
      createdAt: issue.createdAt.toISOString(),
      priority: issue.priority,
      status: issue.status,
      moderationStatus: issue.moderationStatus,
      category: issue.category,
      department: issue.department,
      images: issue.images || [],
      reporter: issue.reporter
    }))

    return ok(res, {
      items: formattedIssues,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
        hasMore: skip + issues.length < total
      }
    })
  } catch (error) {
    logger.error('Error fetching pending issues:', error)
    return fail(res, 500, 'Failed to fetch pending issues')
  }
}

/**
 * Escalate an issue that cannot be resolved
 * Changes status to ESCALATED and notifies supervisors
 * POST /api/v1/issues/:id/escalate
 */
export const escalateIssue = async (req, res) => {
  try {
    const { id } = req.params
    const { reason } = req.body
    const userId = req.user?.id

    if (!reason || reason.trim().length < 10) {
      return fail(res, 400, 'Escalation reason must be at least 10 characters')
    }

    // Get current issue
    const issue = await prisma.issue.findUnique({
      where: { id },
      include: {
        department: true,
        assignedTo: true
      }
    })

    if (!issue) {
      return fail(res, 404, 'Issue not found')
    }

    // Only assigned staff or admins can escalate
    const canEscalate = 
      issue.assignedToId === userId ||
      req.user?.roles?.includes('ADMIN') ||
      req.user?.roles?.includes('SUPER_ADMIN')

    if (!canEscalate) {
      return fail(res, 403, 'Only assigned staff or admins can escalate issues')
    }

    // Valid states for escalation
    const validStates = ['ASSIGNED_TO_STAFF', 'IN_PROGRESS', 'WORK_COMPLETED']
    if (!validStates.includes(issue.status)) {
      return fail(res, 400, `Cannot escalate issue in ${issue.status} status`)
    }

    // Update issue to escalated
    const updatedIssue = await prisma.issue.update({
      where: { id },
      data: {
        status: 'ESCALATED',
        escalatedAt: new Date(),
        escalationReason: reason,
        timeline: {
          create: {
            status: 'ESCALATED',
            note: `Issue escalated: ${reason}`,
            performedById: userId
          }
        }
      },
      include: {
        reporter: {
          select: { id: true, name: true, email: true }
        },
        department: true,
        assignedTo: true,
        category: true
      }
    })

    // Create notification for department heads and admins using new notification service
    const departmentHeads = await prisma.user.findMany({
      where: {
        departmentId: issue.departmentId,
        roles: { has: 'DEPARTMENT_HEAD' }
      }
    })

    // Notify department heads and reporter
    try {
      // Notify department heads
      for (const head of departmentHeads) {
        await notificationService.createNotification({
          userId: head.id,
          title: 'Issue Escalated',
          message: `Issue #${issue.reportId} has been escalated: ${reason}`,
          type: 'WARNING',
          category: 'escalation',
          relatedIssueId: issue.id,
          actionUrl: `/issue/${issue.id}`,
          priority: 'HIGH'
        });
      }

      // Notify the reporter that their issue was escalated
      if (issue.reporterId && issue.reporterId !== userId) {
        await notificationService.createNotification({
          userId: issue.reporterId,
          title: 'Your Issue Was Escalated',
          message: `Issue #${issue.reportId} "${issue.title}" has been escalated for higher-level attention`,
          type: 'INFO',
          category: 'escalation',
          relatedIssueId: issue.id,
          actionUrl: `/issue/${issue.id}`,
          priority: 'HIGH'
        });
      }

      // Notify the assigned staff (if different from escalator)
      if (issue.assignedToId && issue.assignedToId !== userId) {
        await notificationService.createNotification({
          userId: issue.assignedToId,
          title: 'Issue Escalated',
          message: `Issue #${issue.reportId} that you're working on has been escalated: ${reason}`,
          type: 'WARNING',
          category: 'escalation',
          relatedIssueId: issue.id,
          actionUrl: `/issue/${issue.id}`,
          priority: 'HIGH'
        });
      }
    } catch (notifError) {
      logger.error('Failed to create escalation notifications', {
        issueId: id,
        error: notifError.message
      });
    }

    // Log escalation
    logger.info('Issue escalated', {
      issueId: id,
      reportId: issue.reportId,
      escalatedBy: userId,
      reason,
      previousStatus: issue.status
    })

    // Emit socket event
    const io = req.app.get('io')
    if (io) {
      io.to(`issue:${id}`).emit('issue:escalated', updatedIssue)
      io.to(`department:${issue.departmentId}`).emit('issue:escalated', {
        issueId: id,
        reportId: issue.reportId,
        reason
      })
    }

    return ok(res, updatedIssue, 'Issue escalated successfully')
  } catch (error) {
    logger.error('Error escalating issue:', error)
    return fail(res, 500, 'Failed to escalate issue')
  }
}
