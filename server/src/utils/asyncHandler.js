/**
 * Async Route Handler Wrapper
 * 
 * Wraps async Express route handlers to automatically catch rejected promises
 * and forward them to Express error handling middleware, preventing uncaught
 * exceptions from crashing the server.
 * 
 * @module utils/asyncHandler
 * 
 * @example
 * // Before (unsafe - can cause uncaught rejections):
 * router.get('/users', async (req, res) => {
 *   const users = await prisma.user.findMany() // If this throws, server crashes
 *   res.json(users)
 * })
 * 
 * @example
 * // After (safe - errors flow to error middleware):
 * import { asyncHandler } from '../utils/asyncHandler.js'
 * 
 * router.get('/users', asyncHandler(async (req, res) => {
 *   const users = await prisma.user.findMany() // If this throws, caught by wrapper
 *   res.json(users)
 * }))
 * 
 * @example
 * // Using with middleware chains:
 * router.post('/issues', 
 *   auth(['CITIZEN']), 
 *   validate(issueSchema), 
 *   asyncHandler(async (req, res) => {
 *     const issue = await createIssue(req.body)
 *     res.status(201).json(issue)
 *   })
 * )
 */

/**
 * Wraps an async Express route handler to catch promise rejections
 * 
 * @param {Function} fn - Async route handler function (req, res, next) => Promise
 * @returns {Function} Wrapped handler that forwards errors to next()
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

/**
 * Alternative name for backwards compatibility
 * @deprecated Use asyncHandler instead for consistency
 */
export const asyncErrorHandler = asyncHandler

/**
 * Wraps multiple async handlers (useful for batch wrapping)
 * 
 * @param {Array<Function>} handlers - Array of async route handlers
 * @returns {Array<Function>} Array of wrapped handlers
 * 
 * @example
 * const [getUserHandler, updateUserHandler] = wrapHandlers([
 *   async (req, res) => { ... },
 *   async (req, res) => { ... }
 * ])
 */
export const wrapHandlers = (handlers) => {
  return handlers.map(handler => asyncHandler(handler))
}

/**
 * Wraps an async middleware function
 * 
 * @param {Function} middleware - Async middleware (req, res, next) => Promise
 * @returns {Function} Wrapped middleware
 * 
 * @example
 * const loadUser = asyncMiddleware(async (req, res, next) => {
 *   req.user = await prisma.user.findUnique({ where: { id: req.userId } })
 *   next()
 * })
 */
export const asyncMiddleware = (middleware) => {
  return (req, res, next) => {
    Promise.resolve(middleware(req, res, next))
      .catch(next)
  }
}

export default asyncHandler
