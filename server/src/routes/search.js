/**
 * Search Routes
 * API endpoints for search and filter operations
 */

import express from 'express'
import * as searchController from '../controllers/searchController.js'
import { auth } from '../middlewares/auth.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const router = express.Router()

/**
 * @route   GET /api/search/issues
 * @desc    Search issues with filters
 * @access  Authenticated users
 */
router.get(
  '/issues',
  auth(),
  asyncHandler(searchController.searchIssues)
)

/**
 * @route   GET /api/search/users
 * @desc    Search users
 * @access  Staff, Moderator, Admin
 */
router.get(
  '/users',
  auth(['staff', 'moderator', 'dept_admin', 'super_admin']),
  asyncHandler(searchController.searchUsers)
)

/**
 * @route   GET /api/search/departments
 * @desc    Search departments
 * @access  Authenticated users
 */
router.get(
  '/departments',
  auth(),
  asyncHandler(searchController.searchDepartments)
)

/**
 * @route   GET /api/search/global
 * @desc    Global search across all entities
 * @access  Authenticated users
 */
router.get(
  '/global',
  auth(),
  asyncHandler(searchController.globalSearch)
)

/**
 * @route   GET /api/search/suggestions
 * @desc    Get search suggestions
 * @access  Authenticated users
 */
router.get(
  '/suggestions',
  auth(),
  asyncHandler(searchController.getSearchSuggestions)
)

/**
 * @route   POST /api/search/saved
 * @desc    Save a search
 * @access  Authenticated users
 */
router.post(
  '/saved',
  auth(),
  asyncHandler(searchController.saveSearch)
)

/**
 * @route   GET /api/search/saved
 * @desc    Get user's saved searches
 * @access  Authenticated users
 */
router.get(
  '/saved',
  auth(),
  asyncHandler(searchController.getSavedSearches)
)

/**
 * @route   DELETE /api/search/saved/:id
 * @desc    Delete a saved search
 * @access  Authenticated users
 */
router.delete(
  '/saved/:id',
  auth(),
  asyncHandler(searchController.deleteSavedSearch)
)

export default router
