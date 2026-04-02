/**
 * Search Service
 * Provides advanced search functionality across issues, users, and departments
 */

import prisma from '../config/prisma.js'
import logger from '../utils/logger.js'

/**
 * Search issues with advanced filters
 * @param {Object} params - Search parameters
 * @returns {Promise<Object>} Search results with pagination
 */
export const searchIssues = async ({
  query = '',
  status = [],
  category = [],
  department = [],
  priority = [],
  assignedTo = null,
  reportedBy = null,
  dateFrom = null,
  dateTo = null,
  location = null,
  hasMedia = null,
  page = 1,
  limit = 20,
  sortBy = 'createdAt',
  sortOrder = 'desc',
  userId = null,
  userRoles = []
}) => {
  try {
    const skip = (page - 1) * limit
    const where = {}

    // Text search across multiple fields
    if (query && query.trim()) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { reportId: { contains: query, mode: 'insensitive' } },
        { address: { contains: query, mode: 'insensitive' } },
        { 
          reporter: {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { email: { contains: query, mode: 'insensitive' } }
            ]
          }
        }
      ]
    }

    // Status filter
    if (status && status.length > 0) {
      where.status = { in: status }
    }

    // Category filter
    if (category && category.length > 0) {
      where.categoryId = { in: category }
    }

    // Department filter
    if (department && department.length > 0) {
      where.departmentId = { in: department }
    }

    // Priority filter
    if (priority && priority.length > 0) {
      where.priority = { in: priority }
    }

    // Assigned to filter
    if (assignedTo) {
      where.assignedToId = assignedTo
    }

    // Reported by filter
    if (reportedBy) {
      where.reporterId = reportedBy
    }

    // Date range filter
    if (dateFrom || dateTo) {
      where.createdAt = {}
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom)
      }
      if (dateTo) {
        where.createdAt.lte = new Date(dateTo)
      }
    }

    // Location filter (search in address)
    if (location) {
      where.address = { contains: location, mode: 'insensitive' }
    }

    // Has media filter
    if (hasMedia !== null) {
      if (hasMedia) {
        where.media = { isEmpty: false }
      } else {
        where.OR = [
          { media: { isEmpty: true } },
          { media: null }
        ]
      }
    }

    // Role-based access control
    if (userRoles.includes('citizen') && !userRoles.includes('staff') && !userRoles.includes('moderator')) {
      // Citizens can only see their own issues
      where.reporterId = userId
    }

    // Build order by
    const orderBy = {}
    orderBy[sortBy] = sortOrder

    // Execute search with pagination
    const [issues, total] = await Promise.all([
      prisma.issue.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          category: {
            select: { id: true, name: true, icon: true }
          },
          department: {
            select: { id: true, name: true }
          },
          reporter: {
            select: { id: true, name: true, email: true }
          },
          assignedTo: {
            select: { id: true, name: true, email: true }
          },
          _count: {
            select: {
              comments: true,
              votes: true
            }
          }
        }
      }),
      prisma.issue.count({ where })
    ])

    return {
      success: true,
      data: issues,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + issues.length < total
      }
    }
  } catch (error) {
    logger.error('Error searching issues:', error)
    throw error
  }
}

/**
 * Search users
 * @param {Object} params - Search parameters
 * @returns {Promise<Object>} Search results
 */
export const searchUsers = async ({
  query = '',
  roles = [],
  department = [],
  isActive = null,
  page = 1,
  limit = 20,
  sortBy = 'name',
  sortOrder = 'asc'
}) => {
  try {
    const skip = (page - 1) * limit
    const where = {}

    // Text search
    if (query && query.trim()) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
        { phone: { contains: query, mode: 'insensitive' } }
      ]
    }

    // Role filter
    if (roles && roles.length > 0) {
      where.roles = { hasSome: roles }
    }

    // Department filter
    if (department && department.length > 0) {
      where.departmentId = { in: department }
    }

    // Active status filter
    if (isActive !== null) {
      where.isActive = isActive
    }

    const orderBy = {}
    orderBy[sortBy] = sortOrder

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          roles: true,
          departmentId: true,
          isActive: true,
          createdAt: true,
          department: {
            select: { id: true, name: true }
          },
          _count: {
            select: {
              reportedIssues: true,
              assignedIssues: true
            }
          }
        }
      }),
      prisma.user.count({ where })
    ])

    return {
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + users.length < total
      }
    }
  } catch (error) {
    logger.error('Error searching users:', error)
    throw error
  }
}

/**
 * Search departments
 * @param {Object} params - Search parameters
 * @returns {Promise<Object>} Search results
 */
export const searchDepartments = async ({
  query = '',
  isActive = null,
  page = 1,
  limit = 20
}) => {
  try {
    const skip = (page - 1) * limit
    const where = {}

    if (query && query.trim()) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } }
      ]
    }

    if (isActive !== null) {
      where.isActive = isActive
    }

    const [departments, total] = await Promise.all([
      prisma.department.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: {
          _count: {
            select: {
              issues: true,
              staff: true
            }
          }
        }
      }),
      prisma.department.count({ where })
    ])

    return {
      success: true,
      data: departments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + departments.length < total
      }
    }
  } catch (error) {
    logger.error('Error searching departments:', error)
    throw error
  }
}

/**
 * Global search across all entities
 * @param {Object} params - Search parameters
 * @returns {Promise<Object>} Combined search results
 */
export const globalSearch = async ({
  query,
  types = ['issues', 'users', 'departments'],
  limit = 5,
  userId = null,
  userRoles = []
}) => {
  try {
    if (!query || !query.trim()) {
      return {
        success: true,
        data: {
          issues: [],
          users: [],
          departments: []
        },
        counts: {
          issues: 0,
          users: 0,
          departments: 0
        }
      }
    }

    const results = {}
    const counts = {}

    // Search issues
    if (types.includes('issues')) {
      const issueResults = await searchIssues({
        query,
        limit,
        page: 1,
        userId,
        userRoles
      })
      results.issues = issueResults.data
      counts.issues = issueResults.pagination.total
    }

    // Search users (only for staff, moderators, and admins)
    if (types.includes('users') && !userRoles.includes('citizen')) {
      const userResults = await searchUsers({
        query,
        limit,
        page: 1
      })
      results.users = userResults.data
      counts.users = userResults.pagination.total
    }

    // Search departments
    if (types.includes('departments')) {
      const deptResults = await searchDepartments({
        query,
        limit,
        page: 1
      })
      results.departments = deptResults.data
      counts.departments = deptResults.pagination.total
    }

    return {
      success: true,
      data: results,
      counts
    }
  } catch (error) {
    logger.error('Error in global search:', error)
    throw error
  }
}

/**
 * Get search suggestions
 * @param {String} query - Search query
 * @param {String} type - Type of suggestions (issues, users, categories)
 * @returns {Promise<Array>} Suggestions
 */
export const getSearchSuggestions = async (query, type = 'issues') => {
  try {
    if (!query || query.length < 2) {
      return []
    }

    let suggestions = []

    switch (type) {
      case 'issues':
        suggestions = await prisma.issue.findMany({
          where: {
            OR: [
              { title: { contains: query, mode: 'insensitive' } },
              { reportId: { contains: query, mode: 'insensitive' } }
            ]
          },
          take: 10,
          select: {
            id: true,
            reportId: true,
            title: true,
            status: true
          },
          orderBy: { createdAt: 'desc' }
        })
        break

      case 'users':
        suggestions = await prisma.user.findMany({
          where: {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { email: { contains: query, mode: 'insensitive' } }
            ]
          },
          take: 10,
          select: {
            id: true,
            name: true,
            email: true,
            roles: true
          },
          orderBy: { name: 'asc' }
        })
        break

      case 'categories':
        suggestions = await prisma.category.findMany({
          where: {
            name: { contains: query, mode: 'insensitive' }
          },
          take: 10,
          select: {
            id: true,
            name: true,
            icon: true
          },
          orderBy: { name: 'asc' }
        })
        break

      default:
        suggestions = []
    }

    return suggestions
  } catch (error) {
    logger.error('Error getting search suggestions:', error)
    return []
  }
}

/**
 * Save user search
 * @param {String} userId - User ID
 * @param {Object} searchData - Search parameters
 * @returns {Promise<Object>} Saved search
 */
export const saveUserSearch = async (userId, searchData) => {
  try {
    const { name, query, filters } = searchData

    const savedSearch = await prisma.savedSearch.create({
      data: {
        userId,
        name,
        query,
        filters: filters || {},
        createdAt: new Date()
      }
    })

    return {
      success: true,
      data: savedSearch
    }
  } catch (error) {
    logger.error('Error saving search:', error)
    throw error
  }
}

/**
 * Get user saved searches
 * @param {String} userId - User ID
 * @returns {Promise<Array>} Saved searches
 */
export const getUserSavedSearches = async (userId) => {
  try {
    const searches = await prisma.savedSearch.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    })

    return {
      success: true,
      data: searches
    }
  } catch (error) {
    logger.error('Error getting saved searches:', error)
    throw error
  }
}

/**
 * Delete saved search
 * @param {String} searchId - Search ID
 * @param {String} userId - User ID
 * @returns {Promise<Object>} Result
 */
export const deleteSavedSearch = async (searchId, userId) => {
  try {
    await prisma.savedSearch.deleteMany({
      where: {
        id: searchId,
        userId
      }
    })

    return {
      success: true,
      message: 'Search deleted successfully'
    }
  } catch (error) {
    logger.error('Error deleting saved search:', error)
    throw error
  }
}

export default {
  searchIssues,
  searchUsers,
  searchDepartments,
  globalSearch,
  getSearchSuggestions,
  saveUserSearch,
  getUserSavedSearches,
  deleteSavedSearch
}
