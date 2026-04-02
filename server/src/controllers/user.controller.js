import { validationResult } from 'express-validator'
import prisma from '../config/prisma.js'
import { ok, fail } from '../utils/apiResponse.js'

export const updateProfile = async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return fail(res, 400, 'Invalid input', errors.array())
  const { name, avatarUrl } = req.body
  const updated = await prisma.user.update({
    where: { id: req.user.id },
    data: { name, avatarUrl },
    select: { id: true, email: true, name: true, avatarUrl: true, roles: true, createdAt: true }
  })
  try {
    const io = req.app.get('io')
    if (io && updated?.id) io.to(`user:${updated.id}`).emit('user:update', { id: updated.id, name: updated.name, avatarUrl: updated.avatarUrl })
  } catch (error) {
    logger.warn('Failed to emit user update socket event', {
      event: 'user:update',
      userId: updated?.id,
      error: error.message
    })
  }
  ok(res, { user: updated })
}

export const listUsers = async (req, res) => {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
    select: { id: true, email: true, name: true, avatarUrl: true, roles: true, createdAt: true, isVerified: true, isActive: true }
  })
  res.set('Cache-Control', 'private, max-age=30')
  ok(res, { users })
}
