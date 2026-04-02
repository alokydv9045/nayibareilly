import prisma from '../config/prisma.js';
import CacheService from './cache/CacheService.js';
import { logger } from '../utils/logger.js';

const cacheService = new CacheService();

// Define cache namespaces and TTL
export const CACHE_NAMESPACES = {
  ISSUES: 'issues',
  USERS: 'users',
  DEPARTMENTS: 'departments',
  STATS: 'stats'
};

export const CACHE_TTL = {
  SHORT: 60,      // 1 minute
  MEDIUM: 300,    // 5 minutes
  LONG: 900,      // 15 minutes
  VERY_LONG: 3600 // 1 hour
};

class DatabaseService {
  constructor() {
    this.queryCache = new Map();
    this.queryStats = new Map();
  }

  /**
   * Enhanced issue queries with optimizations
   */
  async getIssuesOptimized(filters = {}, pagination = {}, includeStats = false) {
    const {
      status,
      priority,
      categoryId,
      departmentId,
      userId,
      search,
      startDate,
      endDate,
      location,
      isAnonymous,
    } = filters;

    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = pagination;

    // Generate cache key for this query
    const cacheKey = `issues_${JSON.stringify({ filters, pagination })}`;
    
    // Try to get from cache first
    const cached = await cacheService.get(CACHE_NAMESPACES.ISSUES, cacheKey);
    if (cached) {
      return cached;
    }

    try {
      // Build optimized where clause
      const where = this.buildIssueWhereClause(filters);

      // Build optimized select with only necessary fields for listing
      const select = this.getOptimizedIssueSelect(includeStats);

      // Execute optimized queries in parallel
      const [issues, total] = await Promise.all([
        prisma.issue.findMany({
          where,
          select,
          orderBy: { [sortBy]: sortOrder },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.issue.count({ where }),
      ]);

      const result = {
        issues,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1,
        },
      };

      // Cache the result
      await cacheService.set(CACHE_NAMESPACES.ISSUES, cacheKey, result, CACHE_TTL.SHORT);

      return result;
    } catch (error) {
      logger.error('Database query error in getIssuesOptimized:', error);
      throw error;
    }
  }

  /**
   * Build optimized where clause for issue queries
   */
  buildIssueWhereClause(filters) {
    const where = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.priority) {
      where.priority = filters.priority;
    }

    if (filters.categoryId) {
      where.categoryId = parseInt(filters.categoryId, 10);
    }

    if (filters.departmentId) {
      where.departmentId = parseInt(filters.departmentId, 10);
    }

    if (filters.userId) {
      where.reporterId = parseInt(filters.userId, 10);
    }

    if (filters.isAnonymous !== undefined) {
      where.isAnonymous = filters.isAnonymous;
    }

    if (filters.search) {
      const searchTerm = filters.search.trim();
      where.OR = [
        { title: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
        { address: { contains: searchTerm, mode: 'insensitive' } },
        { landmark: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.createdAt.lte = new Date(filters.endDate);
      }
    }

    if (filters.location) {
      const { latitude, longitude, radius = 5 } = filters.location;
      if (latitude && longitude) {
        // Use spatial query for location-based filtering
        where.AND = [
          {
            latitude: {
              gte: latitude - radius / 111, // Approximate km to degrees
              lte: latitude + radius / 111,
            },
          },
          {
            longitude: {
              gte: longitude - radius / (111 * Math.cos(latitude * Math.PI / 180)),
              lte: longitude + radius / (111 * Math.cos(latitude * Math.PI / 180)),
            },
          },
        ];
      }
    }

    return where;
  }

  /**
   * Get optimized select for issue queries
   */
  getOptimizedIssueSelect(includeStats = false) {
    const baseSelect = {
      id: true,
      reportId: true,
      title: true,
      description: true,
      status: true,
      priority: true,
      address: true,
      landmark: true,
      latitude: true,
      longitude: true,
      isAnonymous: true,
      createdAt: true,
      updatedAt: true,
      viewCount: true,
      upvotes: true,
      downvotes: true,
      totalVotes: true,
      // Optimized relations - only select necessary fields
      category: {
        select: {
          id: true,
          name: true,
          color: true,
          icon: true,
        },
      },
      department: {
        select: {
          id: true,
          name: true,
          color: true,
        },
      },
      reporter: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      // Only include media count, not full media objects for listing
      _count: {
        select: {
          media: true,
          timeline: true,
          comments: true,
        },
      },
    };

    if (includeStats) {
      baseSelect.media = {
        select: {
          id: true,
          url: true,
          filename: true,
          mimeType: true,
        },
        take: 1, // Only first image for preview
      };
    }

    return baseSelect;
  }

  /**
   * Get single issue with full details (cached)
   */
  async getIssueByIdOptimized(id, userId = null) {
    const cacheKey = `issue_${id}_${userId || 'anonymous'}`;
    
    return await cacheService.getOrSet(
      CACHE_NAMESPACES.ISSUES,
      cacheKey,
      async () => {
        const issue = await prisma.issue.findUnique({
          where: { id: parseInt(id, 10) },
          include: {
            category: {
              select: {
                id: true,
                name: true,
                color: true,
                icon: true,
                description: true,
              },
            },
            department: {
              select: {
                id: true,
                name: true,
                description: true,
                contactEmail: true,
                contactPhone: true,
              },
            },
            reporter: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            media: {
              select: {
                id: true,
                url: true,
                filename: true,
                originalName: true,
                mimeType: true,
                size: true,
                createdAt: true,
              },
              orderBy: { createdAt: 'asc' },
            },
            timeline: {
              include: {
                performedBy: {
                  select: {
                    id: true,
                    name: true,
                    role: true,
                  },
                },
              },
              orderBy: { createdAt: 'desc' },
            },
            comments: {
              where: { isActive: true },
              include: {
                author: {
                  select: {
                    id: true,
                    name: true,
                    role: true,
                  },
                },
              },
              orderBy: { createdAt: 'desc' },
              take: 10, // Limit initial comments
            },
            votes: userId
              ? {
                  where: { userId: parseInt(userId, 10) },
                  select: { type: true },
                }
              : false,
            _count: {
              select: {
                comments: true,
                votes: true,
              },
            },
          },
        });

        // Increment view count asynchronously
        if (issue && userId !== issue.reporterId) {
          this.incrementViewCount(issue.id).catch(error =>
            logger.error('Failed to increment view count:', error)
          );
        }

        return issue;
      },
      CACHE_TTL.MEDIUM
    );
  }

  /**
   * Async view count increment (non-blocking)
   */
  async incrementViewCount(issueId) {
    try {
      await prisma.issue.update({
        where: { id: parseInt(issueId, 10) },
        data: { viewCount: { increment: 1 } },
      });

      // Invalidate cache for this issue
      await cacheService.delPattern(CACHE_NAMESPACES.ISSUES, `issue_${issueId}_*`);
    } catch (error) {
      logger.error('Error incrementing view count:', error);
    }
  }

  /**
   * Get categories with caching
   */
  async getCategoriesOptimized() {
    return await cacheService.getOrSet(
      CACHE_NAMESPACES.CATEGORIES,
      'active_categories',
      async () => {
        return await prisma.issueCategory.findMany({
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            description: true,
            color: true,
            icon: true,
            _count: {
              select: {
                issues: true,
              },
            },
          },
          orderBy: { name: 'asc' },
        });
      },
      CACHE_TTL.LONG
    );
  }

  /**
   * Get departments with caching
   */
  async getDepartmentsOptimized() {
    return await cacheService.getOrSet(
      CACHE_NAMESPACES.DEPARTMENTS,
      'active_departments',
      async () => {
        return await prisma.department.findMany({
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            description: true,
            contactEmail: true,
            contactPhone: true,
            _count: {
              select: {
                issues: true,
                staff: true,
              },
            },
          },
          orderBy: { name: 'asc' },
        });
      },
      CACHE_TTL.LONG
    );
  }

  /**
   * Get dashboard analytics with caching
   */
  async getDashboardAnalytics(userId, userRole) {
    const cacheKey = `dashboard_${userRole}_${userId || 'all'}`;
    
    return await cacheService.getOrSet(
      CACHE_NAMESPACES.ANALYTICS,
      cacheKey,
      async () => {
        const baseWhere = userRole === 'citizen' ? { reporterId: userId } : {};

        const [
          totalIssues,
          pendingIssues,
          inProgressIssues,
          resolvedIssues,
          categoryStats,
          departmentStats,
          recentIssues,
          priorityStats,
        ] = await Promise.all([
          prisma.issue.count({ where: baseWhere }),
          prisma.issue.count({ where: { ...baseWhere, status: 'PENDING' } }),
          prisma.issue.count({ where: { ...baseWhere, status: 'IN_PROGRESS' } }),
          prisma.issue.count({ where: { ...baseWhere, status: 'RESOLVED' } }),
          this.getCategoryStats(baseWhere),
          this.getDepartmentStats(baseWhere),
          this.getRecentIssues(baseWhere),
          this.getPriorityStats(baseWhere),
        ]);

        return {
          totalIssues,
          pendingIssues,
          inProgressIssues,
          resolvedIssues,
          categoryStats,
          departmentStats,
          recentIssues,
          priorityStats,
        };
      },
      CACHE_TTL.SHORT
    );
  }

  /**
   * Get category statistics
   */
  async getCategoryStats(baseWhere = {}) {
    return await prisma.issueCategory.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        color: true,
        _count: {
          select: {
            issues: {
              where: baseWhere,
            },
          },
        },
      },
      orderBy: {
        issues: {
          _count: 'desc',
        },
      },
      take: 10,
    });
  }

  /**
   * Get department statistics
   */
  async getDepartmentStats(baseWhere = {}) {
    return await prisma.department.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            issues: {
              where: baseWhere,
            },
          },
        },
      },
      orderBy: {
        issues: {
          _count: 'desc',
        },
      },
      take: 10,
    });
  }

  /**
   * Get recent issues
   */
  async getRecentIssues(baseWhere = {}) {
    return await prisma.issue.findMany({
      where: baseWhere,
      select: {
        id: true,
        reportId: true,
        title: true,
        status: true,
        priority: true,
        createdAt: true,
        category: {
          select: {
            name: true,
            color: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });
  }

  /**
   * Get priority statistics
   */
  async getPriorityStats(baseWhere = {}) {
    const priorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
    
    const stats = await Promise.all(
      priorities.map(async priority => {
        const count = await prisma.issue.count({
          where: { ...baseWhere, priority },
        });
        return { priority, count };
      })
    );

    return stats;
  }

  /**
   * Search issues with full-text search and caching
   */
  async searchIssuesOptimized(query, filters = {}, pagination = {}) {
    const cacheKey = `search_${query}_${JSON.stringify({ filters, pagination })}`;
    
    return await cacheService.getOrSet(
      CACHE_NAMESPACES.SEARCH,
      cacheKey,
      async () => {
        const searchWhere = {
          ...this.buildIssueWhereClause(filters),
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { address: { contains: query, mode: 'insensitive' } },
            { landmark: { contains: query, mode: 'insensitive' } },
            {
              category: {
                name: { contains: query, mode: 'insensitive' },
              },
            },
            {
              department: {
                name: { contains: query, mode: 'insensitive' },
              },
            },
          ],
        };

        const { page = 1, limit = 10 } = pagination;

        const [issues, total] = await Promise.all([
          prisma.issue.findMany({
            where: searchWhere,
            select: this.getOptimizedIssueSelect(),
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
          }),
          prisma.issue.count({ where: searchWhere }),
        ]);

        return {
          issues,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
          query,
        };
      },
      CACHE_TTL.SHORT
    );
  }

  /**
   * Invalidate related caches when issue is updated
   */
  async invalidateIssueCaches(issueId, categoryId = null, departmentId = null) {
    const promises = [
      cacheService.delPattern(CACHE_NAMESPACES.ISSUES, `issue_${issueId}_*`),
      cacheService.delPattern(CACHE_NAMESPACES.ISSUES, 'issues_*'),
      cacheService.delPattern(CACHE_NAMESPACES.ANALYTICS, '*'),
      cacheService.delPattern(CACHE_NAMESPACES.SEARCH, '*'),
    ];

    if (categoryId) {
      promises.push(cacheService.del(CACHE_NAMESPACES.CATEGORIES, 'active_categories'));
    }

    if (departmentId) {
      promises.push(cacheService.del(CACHE_NAMESPACES.DEPARTMENTS, 'active_departments'));
    }

    await Promise.all(promises);
  }

  /**
   * Get query performance statistics
   */
  getQueryStats() {
    return {
      cacheHits: this.queryCache.size,
      queryStats: Object.fromEntries(this.queryStats),
    };
  }

  /**
   * Cleanup resources
   */
  async cleanup() {
    this.queryCache.clear();
    this.queryStats.clear();
  }
}

export default new DatabaseService();