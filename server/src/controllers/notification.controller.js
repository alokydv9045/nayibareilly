import prisma from '../config/prisma.js'
import { ok, fail } from '../utils/apiResponse.js'

export const listNotifications = async (req, res) => {
  const userId = req.user.id
  const items = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 100,
    select: { id: true, title: true, message: true, createdAt: true, read: true, type: true }
  })
  ok(res, items)
}

export const unreadCount = async (req, res) => {
  const userId = req.user.id
  const count = await prisma.notification.count({ where: { userId, read: false } })
  ok(res, { count })
}

export const markRead = async (req, res) => {
  const userId = req.user.id
  const id = req.params.id
  const result = await prisma.notification.updateMany({ where: { id, userId }, data: { read: true } })
  if (result.count === 0) return fail(res, 404, 'Notification not found')
  ok(res, {})
}

export const markAllRead = async (req, res) => {
  const userId = req.user.id
  await prisma.notification.updateMany({ where: { userId, read: false }, data: { read: true } })
  ok(res, {})
}
