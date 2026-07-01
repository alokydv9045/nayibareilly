import prisma from '../config/prisma.js'

export class UserService {
  /**
   * Update user profile
   * @param {string} userId - User ID
   * @param {Object} data - Profile data to update
   * @returns {Promise<Object>} Updated user profile
   */
  async updateProfile(userId, data) {
    const { name, avatarUrl } = data
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { name, avatarUrl },
      select: { id: true, email: true, name: true, avatarUrl: true, roles: true, createdAt: true }
    })
    return updated
  }

  /**
   * List users
   * @param {Object} options - Pagination options
   * @returns {Promise<Array>} List of users
   */
  async listUsers(options = {}) {
    const { take = 100, skip = 0 } = options
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take,
      skip,
      select: { id: true, email: true, name: true, avatarUrl: true, roles: true, createdAt: true, isVerified: true, isActive: true }
    })
    return users
  }
}

export default new UserService()
