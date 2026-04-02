import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { validationResult } from 'express-validator'
import prisma from '../config/prisma.js'
import { ok, created, fail } from '../utils/apiResponse.js'
import { sendMail } from '../services/email.js'
import { authLogger, securityMonitor } from '../utils/auditLogger.js'

// Hash refresh tokens before storing (plaintext column removed) using HMAC-SHA256
const hashRefreshToken = (token) => {
  const pepper = process.env.REFRESH_TOKEN_HASH_PEPPER || ''
  return crypto.createHmac('sha256', pepper || 'default_pepper').update(token).digest('hex')
}

// Helper to create a refresh token record using only hashed persistence
const createHashedRefreshToken = async ({ userId, req }) => {
  const rt = crypto.randomBytes(32).toString('hex')
  const tokenHash = hashRefreshToken(rt)
  const expiresAt = new Date(Date.now() + parseDurationMs(process.env.JWT_REFRESH_EXPIRES_IN || '7d', 7 * 24 * 60 * 60 * 1000))
  await prisma.refreshToken.create({
    data: {
      tokenHash,
      userId,
      isValid: true,
      expiresAt,
      userAgent: req.get('User-Agent') || null,
      ipAddress: req.ip || req.connection?.remoteAddress || null,
      lastUsed: new Date()
    }
  })
  return { rt, expiresAt }
}

// Lookup helper (hash-only)
const findRefreshTokenRecord = async (rt) => {
  if (!rt) return null
  const tokenHash = hashRefreshToken(rt)
  return prisma.refreshToken.findFirst({ where: { tokenHash }, include: { user: true } })
}

// Grace rotation window: allow the immediately previous token for a short window (single use)
const GRACE_WINDOW_MS = Number(process.env.REFRESH_GRACE_WINDOW_MS || 5000)
// Map oldTokenHash -> { newTokenHash, expiresAt, used }
const graceMap = new Map()

// Cleanup periodically to avoid unbounded growth
setInterval(() => {
  const now = Date.now()
  for (const [k, v] of graceMap.entries()) {
    if (v.expiresAt < now || v.used) graceMap.delete(k)
  }
}, 60_000).unref?.()

const recordGraceMapping = (oldRt, newRt) => {
  try {
    const oldKey = hashRefreshToken(oldRt)
    const newKey = hashRefreshToken(newRt)
    graceMap.set(oldKey, { newTokenHash: newKey, expiresAt: Date.now() + GRACE_WINDOW_MS, used: false })
  } catch (error) {
    logger.warn('Failed to record grace mapping for refresh token', {
      error: error.message
    })
  }
}

const tryGraceRedeem = async (rt) => {
  const key = hashRefreshToken(rt)
  const entry = graceMap.get(key)
  if (!entry) return null
  if (entry.used || entry.expiresAt < Date.now()) {
    graceMap.delete(key)
    return null
  }
  // Mark used so it cannot be replayed
  entry.used = true
  graceMap.set(key, entry)
  // We only allow if the mapped new token is still valid in DB
  const rec = await prisma.refreshToken.findFirst({ where: { tokenHash: entry.newTokenHash, isValid: true }, include: { user: true } })
  return rec || null
}

// Metrics counters (simple in-memory; could be swapped for Prometheus later)
export const refreshMetrics = {
  success: 0,
  failure: 0,
  graceHits: 0,
  consecutiveFailures: 0,
  lastSuccessAt: null,
  lastFailureAt: null,
  reuseAttempts: 0,
  usersLocked: 0
}

const markRefreshSuccess = (grace = false) => {
  refreshMetrics.success++
  refreshMetrics.consecutiveFailures = 0
  refreshMetrics.lastSuccessAt = new Date().toISOString()
  if (grace) refreshMetrics.graceHits++
}

const markRefreshFailure = () => {
  refreshMetrics.failure++
  refreshMetrics.consecutiveFailures++
  refreshMetrics.lastFailureAt = new Date().toISOString()
}

// Track recent rotations for reuse detection (oldTokenHash -> { userId, rotatedAt })
const RECENT_ROTATIONS_TTL_MS = Number(process.env.REFRESH_RECENT_ROTATIONS_TTL_MS || 60_000)
const recentRotations = new Map()
setInterval(() => {
  const now = Date.now()
  for (const [k, v] of recentRotations.entries()) {
    if (now - v.rotatedAt > RECENT_ROTATIONS_TTL_MS) recentRotations.delete(k)
  }
}, 30_000).unref?.()

const recordRotationForReuseDetection = (oldRt, userId) => {
  try {
    const oldHash = hashRefreshToken(oldRt)
    recentRotations.set(oldHash, { userId, rotatedAt: Date.now() })
  } catch (error) {
    logger.warn('Failed to record rotation for reuse detection', {
      userId,
      error: error.message
    })
  }
}

const detectAndHandleReuse = async (rt, req) => {
  if (!rt) return false
  const h = hashRefreshToken(rt)
  const rec = recentRotations.get(h)
  if (!rec) return false
  // If it's in graceMap it would already have been redeemed earlier; here means invalid reuse
  refreshMetrics.reuseAttempts++
  authLogger.tokenReuseDetected(req, { userId: rec.userId, rotatedAt: rec.rotatedAt })
  if (process.env.REFRESH_REUSE_REVOKE_ALL === 'true') {
    try {
      await prisma.refreshToken.updateMany({ where: { userId: rec.userId, isValid: true }, data: { isValid: false, revokedBy: 'reuse_detected', revokedAt: new Date() } })
      refreshMetrics.usersLocked++
    } catch (e) {
      // swallow; logging already done
    }
  }
  return true
}

const signToken = (user) => {
  return jwt.sign({ 
    id: user.id, 
    email: user.email, 
    roles: user.roles || ['citizen'], 
    name: user.name, 
    requestedRole: user.requestedRole || null 
  }, process.env.JWT_SECRET, { 
    expiresIn: process.env.JWT_EXPIRES_IN || '1h' // Reduced from 7d to 1h for better security
  })
}

const parseDurationMs = (val, fallbackMs) => {
  if (!val) return fallbackMs
  const m = String(val).match(/^(\d+)(ms|s|m|h|d)$/i)
  if (!m) return fallbackMs
  const n = Number(m[1])
  const unit = m[2].toLowerCase()
  switch (unit) {
    case 'ms': return n
    case 's': return n * 1000
    case 'm': return n * 60_000
    case 'h': return n * 3_600_000
    case 'd': return n * 86_400_000
    default: return fallbackMs
  }
}

const setRefreshCookie = (res, token) => {
  const maxAge = parseDurationMs(process.env.JWT_REFRESH_EXPIRES_IN || '7d', 7 * 24 * 60 * 60 * 1000)
  res.cookie('rt', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge,
    path: '/',
  })
}

export const register = async (req, res) => {
  try {
    // Input validation
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      await authLogger.registerAttempt(req, { status: 'validation_failed', errors: errors.array() })
      return fail(res, 400, 'Invalid input', errors.array())
    }

    const { email, password, name, phone, address, requestedRole } = req.body
    
    // Validate input data
    if (!email || !password || !name) {
      await authLogger.registerAttempt(req, { status: 'missing_required_fields' })
      return fail(res, 400, 'Email, password, and name are required')
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      await authLogger.registerAttempt(req, { status: 'invalid_email_format', email: email.toLowerCase() })
      return fail(res, 400, 'Invalid email format')
    }

    // Password strength validation
    if (password.length < 8) {
      await authLogger.registerAttempt(req, { status: 'weak_password' })
      return fail(res, 400, 'Password must be at least 8 characters long')
    }
    
    // Validate phone if provided
    if (phone && phone.length < 10) {
      await authLogger.registerAttempt(req, { status: 'invalid_phone' })
      return fail(res, 400, 'Phone number must be at least 10 digits')
    }

    // Check if user already exists
    const exists = await prisma.user.findUnique({ 
      where: { email: email.toLowerCase() },
      select: { id: true, email: true, isActive: true }
    })
    
    if (exists) {
      await authLogger.registerAttempt(req, { status: 'email_exists', email: email.toLowerCase() })
      return fail(res, 409, 'Email already in use')
    }

    // Hash password with higher cost for better security
    const passwordHash = await bcrypt.hash(password, 12)
    
    // Normalize and validate requested role
    const allowedRequestedRoles = ['staff', 'moderator', 'dept_admin']
    const normalizedRequestedRole = typeof requestedRole === 'string' && requestedRole.trim() && 
      allowedRequestedRoles.includes(requestedRole.trim().toLowerCase()) ? requestedRole.trim().toLowerCase() : null
    
    // Create user with transaction for atomicity
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({ 
        data: { 
          email: email.toLowerCase(), 
          passwordHash, 
          name: name.trim(),
          phone: phone ? phone.trim() : null,
          address: address ? address.trim() : null,
          requestedRole: normalizedRequestedRole,
          isActive: true,
          isVerified: false
        }
      })
      
      // Create initial activity log
      await tx.activityLog.create({
        data: {
          action: 'CREATED',
          description: 'User account created',
          userId: newUser.id,
          metadata: { 
            registrationMethod: 'email',
            requestedRole: normalizedRequestedRole,
            hasPhone: !!phone,
            hasAddress: !!address
          },
          ipAddress: req.ip || req.connection?.remoteAddress,
          userAgent: req.get('User-Agent')
        }
      })
      
      return newUser
    })
    
    await authLogger.registerSuccess(req, user.id, { 
      requestedRole: normalizedRequestedRole,
      userCount: await prisma.user.count() 
    })
    
    // Emit Socket.IO event for real-time user registration
    const io = req.app.get('io')
    if (io) {
      const userStats = {
        totalUsers: await prisma.user.count(),
        newUser: {
          id: user.id,
          name: user.name,
          email: user.email,
          roles: user.roles,
          createdAt: user.createdAt
        }
      }
      io.emit('user:new', userStats)
      io.emit('system:stats', userStats)
    }
    
    const token = signToken(user)
    const { rt } = await createHashedRefreshToken({ userId: user.id, req })
    setRefreshCookie(res, rt)
    
    // Return sanitized user data
    const userData = {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      address: user.address,
      roles: user.roles,
      requestedRole: user.requestedRole,
      isVerified: user.isVerified,
      createdAt: user.createdAt
    }
    
    created(res, { 
      token, 
      user: userData,
      message: 'Registration successful. Please check your email for verification.'
    })
    
  } catch (error) {
    await authLogger.registerAttempt(req, { 
      status: 'error', 
      error: error.message, 
      email: req.body?.email?.toLowerCase() 
    })
    
    // Handle specific database errors
    if (error.code === 'P2002') {
      return fail(res, 409, 'Email already in use')
    }
    
    console.error('Registration error:', error)
    return fail(res, 500, 'Registration failed. Please try again.')
  }
}

export const login = async (req, res) => {
  try {
    // Input validation
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      await authLogger.loginAttempt(req, { status: 'validation_failed', errors: errors.array() })
      return fail(res, 400, 'Invalid input', errors.array())
    }

    const { email, password } = req.body
    
    // Validate required fields
    if (!email || !password) {
      await authLogger.loginAttempt(req, { status: 'missing_credentials' })
      return fail(res, 400, 'Email and password are required')
    }

    // Find user with additional security checks
    const user = await prisma.user.findUnique({ 
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        name: true,
        roles: true,
        requestedRole: true,
        isActive: true,
        isVerified: true,
        lastLogin: true,
        loginAttempts: true,
        lockUntil: true
      }
    })
    
    if (!user) {
      await authLogger.loginAttempt(req, { status: 'user_not_found', email: email.toLowerCase() })
      await securityMonitor.trackFailedLogin(req, email.toLowerCase())
      return fail(res, 401, 'Invalid credentials')
    }

    // Check if account is locked
    if (user.lockUntil && user.lockUntil > new Date()) {
      await authLogger.loginAttempt(req, { 
        status: 'account_locked', 
        userId: user.id, 
        lockUntil: user.lockUntil 
      })
      return fail(res, 423, 'Account temporarily locked. Please try again later.')
    }

    // Check if account is active
    if (!user.isActive) {
      await authLogger.loginAttempt(req, { status: 'account_inactive', userId: user.id })
      return fail(res, 403, 'Account is deactivated. Please contact support.')
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash)
    if (!isPasswordValid) {
      // Increment login attempts
      const updatedAttempts = (user.loginAttempts || 0) + 1
      const shouldLock = updatedAttempts >= 5
      
      await prisma.user.update({
        where: { id: user.id },
        data: {
          loginAttempts: updatedAttempts,
          lockUntil: shouldLock ? new Date(Date.now() + 15 * 60 * 1000) : null // 15 minutes lock
        }
      })

      await authLogger.loginAttempt(req, { 
        status: 'invalid_password', 
        userId: user.id, 
        email: email.toLowerCase(),
        attempts: updatedAttempts,
        locked: shouldLock
      })
      await securityMonitor.trackFailedLogin(req, email.toLowerCase(), user.id)
      
      return fail(res, 401, shouldLock ? 
        'Too many failed attempts. Account locked for 15 minutes.' : 
        'Invalid credentials')
    }

    // Successful login - reset login attempts
    await prisma.$transaction(async (tx) => {
      await tx.user.update({ 
        where: { id: user.id }, 
        data: { 
          lastLogin: new Date(),
          loginAttempts: 0,
          lockUntil: null
        } 
      })

      // Log successful login activity
      await tx.activityLog.create({
        data: {
          action: 'LOGIN',
          description: 'User logged in successfully',
          userId: user.id,
          metadata: { 
            loginMethod: 'email',
            userAgent: req.get('User-Agent'),
            previousLogin: user.lastLogin
          },
          ipAddress: req.ip || req.connection?.remoteAddress,
          userAgent: req.get('User-Agent')
        }
      })
    })

    await authLogger.loginSuccess(req, user.id, { 
      roles: user.roles,
      lastLogin: user.lastLogin 
    })

    const token = signToken(user)
    const { rt } = await createHashedRefreshToken({ userId: user.id, req })
    
    setRefreshCookie(res, rt)
    
    // Return sanitized user data
    const userData = {
      id: user.id,
      email: user.email,
      name: user.name,
      roles: user.roles,
      requestedRole: user.requestedRole,
      isVerified: user.isVerified,
      lastLogin: user.lastLogin
    }
    
    console.log('[Login] Success, refresh token cookie set for user:', user.email)
    ok(res, { 
      token, 
      user: userData,
      message: 'Login successful'
    })
    
  } catch (error) {
    await authLogger.loginAttempt(req, { 
      status: 'error', 
      error: error.message, 
      email: req.body?.email?.toLowerCase() 
    })
    console.error('Login error:', error)
    return fail(res, 500, 'Login failed. Please try again.')
  }
}

export const me = async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id }, select: { id: true, email: true, name: true, roles: true, avatarUrl: true, isVerified: true, createdAt: true, requestedRole: true } })
  ok(res, { user })
}

export const forgotPassword = async (req, res) => {
  const { email } = req.body
  
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
  if (!user) {
    await authLogger.passwordResetRequest(req, { status: 'user_not_found', email: email.toLowerCase() })
    return ok(res, {})
  }

  try {
    // Generate random token
    const token = crypto.randomBytes(32).toString('hex')
    // Hash the token before storing in database
    const hashedToken = await bcrypt.hash(token, 10)
    const exp = new Date(Date.now() + 3600_000)
    
    await prisma.user.update({ 
      where: { id: user.id }, 
      data: { resetToken: hashedToken, resetTokenExp: exp } 
    })
    
    await authLogger.passwordResetRequest(req, { status: 'success', userId: user.id, email: email.toLowerCase() })
    
    // Send the unhashed token to the user via email
    await sendMail({ 
      to: email, 
      subject: 'Reset your NayiBareilly password', 
      text: `Use this token to reset your password: ${token}`, 
      html: `<p>Use this token to reset your password: <strong>${token}</strong></p>` 
    })
    
    ok(res, {})
  } catch (error) {
    await authLogger.passwordResetRequest(req, { status: 'error', error: error.message, email: email.toLowerCase() })
    console.error('Password reset error:', error)
    return fail(res, 500, 'Failed to send reset email')
  }
}

export const resetPassword = async (req, res) => {
  const { token, password } = req.body
  
  // Find all users with non-expired reset tokens
  const users = await prisma.user.findMany({ 
    where: { 
      resetToken: { not: null }, 
      resetTokenExp: { gt: new Date() } 
    } 
  })
  
  // Find user by comparing hashed tokens
  let user = null
  for (const u of users) {
    if (u.resetToken && await bcrypt.compare(token, u.resetToken)) {
      user = u
      break
    }
  }
  
  if (!user) {
    await authLogger.passwordReset(req, { status: 'invalid_token', token: token?.substring(0, 8) })
    return fail(res, 400, 'Invalid or expired token')
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10)
    await prisma.user.update({ 
      where: { id: user.id }, 
      data: { passwordHash, resetToken: null, resetTokenExp: null } 
    })
    
    await authLogger.passwordReset(req, { status: 'success', userId: user.id })
    
    // Invalidate all refresh tokens for security
    await prisma.refreshToken.updateMany({
      where: { userId: user.id },
      data: { isValid: false }
    })
    
    ok(res, {})
  } catch (error) {
    await authLogger.passwordReset(req, { status: 'error', error: error.message, userId: user.id })
    console.error('Password reset error:', error)
    return fail(res, 500, 'Failed to reset password')
  }
}

export const verifyEmail = async (req, res) => {
  const { token } = req.body
  const user = await prisma.user.findFirst({ where: { verifyToken: token, verifyTokenExp: { gt: new Date() } } })
  if (!user) return fail(res, 400, 'Invalid or expired token')
  
  await prisma.user.update({ where: { id: user.id }, data: { isVerified: true, verifyToken: null, verifyTokenExp: null } })
  
  // Emit Socket.IO event for real-time user verification
  const io = req.app.get('io')
  if (io) {
    const userStats = {
      totalUsers: await prisma.user.count(),
      verifiedUsers: await prisma.user.count({ where: { isVerified: true } }),
      verifiedUser: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    }
    io.emit('user:verified', userStats)
    io.emit('system:stats', userStats)
  }
  
  ok(res, {})
}

export const refresh = async (req, res) => {
  const rt = req.cookies?.rt
  const requestId = crypto.randomBytes(4).toString('hex')
  console.log(`[Refresh-${requestId}] Starting refresh for token: ${rt?.substring(0, 8)}...`)
  
  if (!rt) {
    await authLogger.tokenRefresh(req, { status: 'no_token' })
    return fail(res, 401, 'No refresh token')
  }
  
  const dbToken = await findRefreshTokenRecord(rt)
  console.log(`[Refresh-${requestId}] DB token found: ${!!dbToken}, isValid: ${dbToken?.isValid}, expired: ${dbToken ? dbToken.expiresAt < new Date() : 'N/A'}`)
  
  if (!dbToken || !dbToken.isValid || dbToken.expiresAt < new Date() || !dbToken.user) {
    // Reuse detection path (only if not found or invalid but not grace redeemed)
    if (!dbToken || !dbToken.isValid) {
      const reuse = await detectAndHandleReuse(rt, req)
      if (reuse) {
        // Standard invalid response; metrics already updated via failure path below
        console.log(`[Refresh-${requestId}] Reuse detected for token`)
      }
    }
    // Attempt grace redemption (only for not_found/invalid, not expired)
    let graceRecord = null
    if ((!dbToken || !dbToken.isValid) && !(dbToken && dbToken.expiresAt < new Date())) {
      graceRecord = await tryGraceRedeem(rt)
      if (graceRecord) {
        console.log(`[Refresh-${requestId}] Grace window token accepted`)
      }
    }
    if (graceRecord) {
      // Proceed as if valid using graceRecord
      try {
        await authLogger.tokenRefresh(req, { status: 'success', userId: graceRecord.userId, grace: true })
        const accessToken = signToken(graceRecord.user)
        const { rt: newRt } = await createHashedRefreshToken({ userId: graceRecord.userId, req })
        // Rotate: invalidate all still-valid tokens for that user older than this? (Keep simple: do nothing extra)
        setRefreshCookie(res, newRt)
        console.log(`[Refresh-${requestId}] Grace rotation issued new token: ${newRt.substring(0,8)}...`)
        markRefreshSuccess(true)
        return ok(res, { accessToken, grace: true })
      } catch (err) {
        await authLogger.tokenRefresh(req, { status: 'error', error: err.message, userId: graceRecord.userId, grace: true })
        markRefreshFailure()
        return fail(res, 500, 'Failed to refresh token (grace)')
      }
    }

    await authLogger.tokenRefresh(req, { 
      status: 'invalid_token', 
      reason: !dbToken ? 'not_found' : !dbToken.isValid ? 'invalid' : dbToken.expiresAt < new Date() ? 'expired' : 'no_user'
    })
    console.log(`[Refresh-${requestId}] Token validation failed - clearing cookie and returning 401`)
    res.clearCookie('rt', { path: '/' })
    markRefreshFailure()
    return fail(res, 401, 'Invalid refresh token')
  }

  try {
    await authLogger.tokenRefresh(req, { status: 'success', userId: dbToken.userId })
    const accessToken = signToken(dbToken.user)

    // Avoid rotating on every refresh invocation to prevent client holding stale token when middleware fetch cannot propagate Set-Cookie.
    // Respect a minimum interval unless explicitly forced.
    const MIN_ROTATION_INTERVAL_MS = Number(process.env.MIN_REFRESH_ROTATION_INTERVAL_MS || 60_000)
    const lastUsedMs = dbToken.lastUsed ? new Date(dbToken.lastUsed).getTime() : 0
    const age = Date.now() - lastUsedMs
    const forceRotate = req.headers['x-force-rotate'] === '1'

    if (!forceRotate && lastUsedMs && age < MIN_ROTATION_INTERVAL_MS) {
      // Just update lastUsed; keep existing refresh token valid.
      await prisma.refreshToken.update({
        where: { id: dbToken.id },
        data: { lastUsed: new Date() }
      })
      console.log(`[Refresh-${requestId}] Skipped rotation (age ${age}ms < ${MIN_ROTATION_INTERVAL_MS}ms); returning access token only.`)
      markRefreshSuccess(false)
      return ok(res, { accessToken, rotated: false })
    }

    // Proceed with rotation
    const { rt: newRt } = await createHashedRefreshToken({ userId: dbToken.userId, req })
    console.log(`[Refresh-${requestId}] Creating new token and invalidating old one (hashed)`)
    await prisma.refreshToken.update({
      where: { id: dbToken.id },
      data: { isValid: false, revokedBy: 'token_rotation', revokedAt: new Date() }
    })
    // Record grace mapping (old -> new) allowing a late duplicate request to succeed once
    recordGraceMapping(rt, newRt)
    recordRotationForReuseDetection(rt, dbToken.userId)
    setRefreshCookie(res, newRt)
    console.log(`[Refresh-${requestId}] Success, new token set (hashed): ${newRt.substring(0, 8)}...`)
    markRefreshSuccess(false)
    ok(res, { accessToken, rotated: true })
  } catch (error) {
    await authLogger.tokenRefresh(req, { status: 'error', error: error.message, userId: dbToken.userId })
    console.error('Token refresh error:', error)
    markRefreshFailure()
    return fail(res, 500, 'Failed to refresh token')
  }
}

// Metrics endpoint handler (to be mounted on a protected admin route)
export const getAuthMetrics = async (req, res) => {
  ok(res, { refresh: refreshMetrics })
}

export const logout = async (req, res) => {
  const rt = req.cookies?.rt
  
  try {
    if (rt) {
      const rec = await findRefreshTokenRecord(rt)
      if (rec) {
        await prisma.refreshToken.update({ 
          where: { id: rec.id }, 
          data: { 
            isValid: false,
            revokedAt: new Date(),
            revokedBy: 'user_logout'
          } 
        })
      }
    }
    
    if (req.user?.id) {
      await authLogger.logoutSuccess(req.user.id, req)
    }
    
    res.clearCookie('rt', { path: '/' })
    ok(res, {})
  } catch (error) {
    // Still clear cookie even if database operation fails
    res.clearCookie('rt', { path: '/' })
    console.error('Logout error:', error)
    ok(res, {})
  }
}

export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body || {}
  
  if (!currentPassword || !newPassword || String(newPassword).length < 6) {
    await authLogger.passwordChange(req, { status: 'validation_failed', userId: req.user?.id })
    return fail(res, 400, 'Invalid input')
  }
  
  const user = await prisma.user.findUnique({ where: { id: req.user.id } })
  if (!user) {
    await authLogger.passwordChange(req, { status: 'user_not_found', userId: req.user?.id })
    return fail(res, 404, 'User not found')
  }
  
  const okPw = await bcrypt.compare(String(currentPassword), user.passwordHash)
  if (!okPw) {
    await authLogger.passwordChange(req, { status: 'invalid_current_password', userId: user.id })
    await securityMonitor.trackFailedPasswordChange(req, user.id)
    return fail(res, 400, 'Current password incorrect')
  }

  try {
    const passwordHash = await bcrypt.hash(String(newPassword), 10)
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash } })
    
    await authLogger.passwordChange(req, { status: 'success', userId: user.id })
    
    // Invalidate all refresh tokens for security
    await prisma.refreshToken.updateMany({
      where: { userId: user.id },
      data: { isValid: false }
    })
    
    ok(res, {})
  } catch (error) {
    await authLogger.passwordChange(req, { status: 'error', error: error.message, userId: user.id })
    console.error('Password change error:', error)
    return fail(res, 500, 'Failed to change password')
  }
}
