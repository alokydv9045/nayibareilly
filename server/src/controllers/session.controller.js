import crypto from 'crypto'
import prisma from '../config/prisma.js'
import { ok, fail } from '../utils/apiResponse.js'
import { authLogger } from '../utils/auditLogger.js'

// Get user's active sessions
export const getUserSessions = async (req, res) => {
  try {
    const userId = req.user.id
    
    const sessions = await prisma.refreshToken.findMany({
      where: {
        userId,
        isValid: true,
        expiresAt: { gt: new Date() }
      },
      select: {
        id: true,
        createdAt: true,
        expiresAt: true,
        lastUsed: true,
        userAgent: true,
        ipAddress: true,
        // Don't return the actual token for security
        token: false
      },
      orderBy: { lastUsed: 'desc' }
    })

    // Add current session indicator
    const currentRefreshToken = req.cookies?.rt
    const sessionsWithCurrent = sessions.map(session => ({
      ...session,
      isCurrent: false // We'll mark this properly if we can match
    }))

    await authLogger.sessionView(req, { userId, sessionCount: sessions.length })

    ok(res, { sessions: sessionsWithCurrent, total: sessions.length })
  } catch (error) {
    console.error('Get sessions error:', error)
    fail(res, 'Failed to retrieve sessions', null, 500)
  }
}

// Revoke a specific session
export const revokeSession = async (req, res) => {
  try {
    const userId = req.user.id
    const { sessionId } = req.params
    
    if (!sessionId) {
      return fail(res, 'Session ID is required', null, 400)
    }

    // Verify the session belongs to the user
    const session = await prisma.refreshToken.findFirst({
      where: {
        id: parseInt(sessionId),
        userId,
        isValid: true
      }
    })

    if (!session) {
      await authLogger.sessionRevoke(req, { 
        status: 'session_not_found', 
        userId, 
        sessionId 
      })
      return fail(res, 'Session not found or already revoked', null, 404)
    }

    // Revoke the session
    await prisma.refreshToken.update({
      where: { id: parseInt(sessionId) },
      data: { 
        isValid: false,
        revokedAt: new Date(),
        revokedBy: 'user'
      }
    })

    await authLogger.sessionRevoke(req, { 
      status: 'success', 
      userId, 
      sessionId,
      revokedSessionCreated: session.createdAt
    })

    ok(res, { message: 'Session revoked successfully' })
  } catch (error) {
    await authLogger.sessionRevoke(req, { 
      status: 'error', 
      error: error.message, 
      userId: req.user?.id,
      sessionId: req.params?.sessionId
    })
    console.error('Revoke session error:', error)
    fail(res, 'Failed to revoke session', null, 500)
  }
}

// Revoke all other sessions (except current)
export const revokeAllOtherSessions = async (req, res) => {
  try {
    const userId = req.user.id
    const currentRefreshToken = req.cookies?.rt

    // Get current session to exclude it
    let currentSessionId = null
    if (currentRefreshToken) {
      const currentSession = await prisma.refreshToken.findUnique({
        where: { token: currentRefreshToken },
        select: { id: true }
      })
      currentSessionId = currentSession?.id
    }

    // Build where clause to exclude current session
    const whereClause = {
      userId,
      isValid: true
    }
    
    if (currentSessionId) {
      whereClause.id = { not: currentSessionId }
    }

    // Count sessions to be revoked
    const sessionsToRevoke = await prisma.refreshToken.count({ where: whereClause })

    // Revoke all other sessions
    await prisma.refreshToken.updateMany({
      where: whereClause,
      data: { 
        isValid: false,
        revokedAt: new Date(),
        revokedBy: 'user_bulk'
      }
    })

    await authLogger.sessionRevokeAll(req, { 
      status: 'success', 
      userId, 
      revokedCount: sessionsToRevoke,
      keptCurrentSession: !!currentSessionId
    })

    ok(res, { 
      message: `Successfully revoked ${sessionsToRevoke} other sessions`,
      revokedCount: sessionsToRevoke
    })
  } catch (error) {
    await authLogger.sessionRevokeAll(req, { 
      status: 'error', 
      error: error.message, 
      userId: req.user?.id
    })
    console.error('Revoke all sessions error:', error)
    fail(res, 'Failed to revoke sessions', null, 500)
  }
}

// Force logout from all devices (including current)
export const revokeAllSessions = async (req, res) => {
  try {
    const userId = req.user.id

    // Count all active sessions
    const totalSessions = await prisma.refreshToken.count({
      where: {
        userId,
        isValid: true
      }
    })

    // Revoke ALL sessions including current
    await prisma.refreshToken.updateMany({
      where: {
        userId,
        isValid: true
      },
      data: { 
        isValid: false,
        revokedAt: new Date(),
        revokedBy: 'user_force_logout'
      }
    })

    // Clear the current refresh token cookie
    res.clearCookie('rt', { path: '/' })

    await authLogger.sessionRevokeAll(req, { 
      status: 'force_logout', 
      userId, 
      revokedCount: totalSessions,
      includedCurrentSession: true
    })

    ok(res, { 
      message: `Force logout successful. Revoked ${totalSessions} sessions.`,
      revokedCount: totalSessions,
      requiresRelogin: true
    })
  } catch (error) {
    await authLogger.sessionRevokeAll(req, { 
      status: 'error', 
      error: error.message, 
      userId: req.user?.id
    })
    console.error('Force logout error:', error)
    fail(res, 'Failed to force logout', null, 500)
  }
}

// Get session statistics for admin/debugging
export const getSessionStats = async (req, res) => {
  try {
    const userId = req.user.id
    
    const stats = await prisma.refreshToken.groupBy({
      by: ['isValid'],
      where: { userId },
      _count: { _all: true }
    })

    const activeCount = stats.find(s => s.isValid)?._count._all || 0
    const revokedCount = stats.find(s => !s.isValid)?._count._all || 0

    const recentActivity = await prisma.refreshToken.findMany({
      where: { userId },
      select: {
        createdAt: true,
        lastUsed: true,
        isValid: true,
        revokedAt: true,
        userAgent: true,
        ipAddress: true
      },
      orderBy: { lastUsed: 'desc' },
      take: 5
    })

    ok(res, {
      stats: {
        activeSessions: activeCount,
        revokedSessions: revokedCount,
        totalSessions: activeCount + revokedCount
      },
      recentActivity
    })
  } catch (error) {
    console.error('Get session stats error:', error)
    fail(res, 'Failed to get session statistics', null, 500)
  }
}