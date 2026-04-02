/**
 * Search Controller
 * Handles search requests and filter operations
 */

import * as searchService from '../services/searchService.js'
import logger from '../utils/logger.js'

/**
 * Search issues
 * GET /api/search/issues
 */
export const searchIssues = async (req, res) => {
  try {
    const {
      query,
      status,
      category,
      department,
      priority,
      assignedTo,
      reportedBy,
      dateFrom,
      dateTo,
      location,
      hasMedia,
      page,
      limit,
      sortBy,
      sortOrder
    } = req.query

    const userId = req.user?.id
    const userRoles = req.user?.roles || []

    // Parse array parameters
    const statusArray = status ? (Array.isArray(status) ? status : [status]) : []
    const categoryArray = category ? (Array.isArray(category) ? category : [category]) : []
    const departmentArray = department ? (Array.isArray(department) ? department : [department]) : []
    const priorityArray = priority ? (Array.isArray(priority) ? priority : [priority]) : []

    const results = await searchService.searchIssues({
      query,
      status: statusArray,
      category: categoryArray,
      department: departmentArray,
      priority: priorityArray,
      assignedTo,
      reportedBy,
      dateFrom,
      dateTo,
      location,
      hasMedia: hasMedia ? hasMedia === 'true' : null,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      sortBy: sortBy || 'createdAt',
      sortOrder: sortOrder || 'desc',
      userId,
      userRoles
    })

    res.json(results)
  } catch (error) {
    logger.error('Error in searchIssues controller:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to search issues',
      error: error.message
    })
  }
}

/**
 * Search users
 * GET /api/search/users
 */
export const searchUsers = async (req, res) => {
  try {
    const {
      query,
      roles,
      department,
      isActive,
      page,
      limit,
      sortBy,
      sortOrder
    } = req.query

    // Parse array parameters
    const rolesArray = roles ? (Array.isArray(roles) ? roles : [roles]) : []
    const departmentArray = department ? (Array.isArray(department) ? department : [department]) : []

    const results = await searchService.searchUsers({
      query,
      roles: rolesArray,
      department: departmentArray,
      isActive: isActive ? isActive === 'true' : null,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      sortBy: sortBy || 'name',
      sortOrder: sortOrder || 'asc'
    })

    res.json(results)
  } catch (error) {
    logger.error('Error in searchUsers controller:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to search users',
      error: error.message
    })
  }
}

/**
 * Search departments
 * GET /api/search/departments
 */
export const searchDepartments = async (req, res) => {
  try {
    const { query, isActive, page, limit } = req.query

    const results = await searchService.searchDepartments({
      query,
      isActive: isActive ? isActive === 'true' : null,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20
    })

    res.json(results)
  } catch (error) {
    logger.error('Error in searchDepartments controller:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to search departments',
      error: error.message
    })
  }
}

/**
 * Global search across all entities
 * GET /api/search/global
 */
export const globalSearch = async (req, res) => {
  try {
    const { query, types, limit } = req.query

    const userId = req.user?.id
    const userRoles = req.user?.roles || []

    // Parse types parameter
    const typesArray = types 
      ? (Array.isArray(types) ? types : types.split(','))
      : ['issues', 'users', 'departments']

    const results = await searchService.globalSearch({
      query,
      types: typesArray,
      limit: parseInt(limit) || 5,
      userId,
      userRoles
    })

    res.json(results)
  } catch (error) {
    logger.error('Error in globalSearch controller:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to perform global search',
      error: error.message
    })
  }
}

/**
 * Get search suggestions
 * GET /api/search/suggestions
 */
export const getSearchSuggestions = async (req, res) => {
  try {
    const { query, type } = req.query

    if (!query || query.length < 2) {
      return res.json({
        success: true,
        data: []
      })
    }

    const suggestions = await searchService.getSearchSuggestions(
      query,
      type || 'issues'
    )

    res.json({
      success: true,
      data: suggestions
    })
  } catch (error) {
    logger.error('Error in getSearchSuggestions controller:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get suggestions',
      error: error.message
    })
  }
}

/**
 * Save user search
 * POST /api/search/saved
 */
export const saveSearch = async (req, res) => {
  try {
    const userId = req.user.id
    const { name, query, filters } = req.body

    if (!name || !query) {
      return res.status(400).json({
        success: false,
        message: 'Name and query are required'
      })
    }

    const result = await searchService.saveUserSearch(userId, {
      name,
      query,
      filters
    })

    res.status(201).json(result)
  } catch (error) {
    logger.error('Error in saveSearch controller:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to save search',
      error: error.message
    })
  }
}

/**
 * Get user saved searches
 * GET /api/search/saved
 */
export const getSavedSearches = async (req, res) => {
  try {
    const userId = req.user.id

    const result = await searchService.getUserSavedSearches(userId)

    res.json(result)
  } catch (error) {
    logger.error('Error in getSavedSearches controller:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get saved searches',
      error: error.message
    })
  }
}

/**
 * Delete saved search
 * DELETE /api/search/saved/:id
 */
export const deleteSavedSearch = async (req, res) => {
  try {
    const userId = req.user.id
    const { id } = req.params

    const result = await searchService.deleteSavedSearch(id, userId)

    res.json(result)
  } catch (error) {
    logger.error('Error in deleteSavedSearch controller:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to delete saved search',
      error: error.message
    })
  }
}

export default {
  searchIssues,
  searchUsers,
  searchDepartments,
  globalSearch,
  getSearchSuggestions,
  saveSearch,
  getSavedSearches,
  deleteSavedSearch
}
