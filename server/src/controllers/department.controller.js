import { validationResult } from 'express-validator'
import prisma from '../config/prisma.js'
import { ok, created, fail } from '../utils/apiResponse.js'
import logger from '../utils/logger.js'
import { emitDepartmentStats } from '../utils/realtime.js'

export const listDepartments = async (_req, res) => {
  const items = await prisma.department.findMany({
    orderBy: { name: 'asc' },
    select: {
      id: true, name: true, description: true, code: true,
      contactEmail: true, contactPhone: true, isActive: true,
      slaHours: true, priority: true, budget: true,
      createdAt: true, updatedAt: true,
    }
  })
  ok(res, { items })
}

export const getDepartment = async (req, res) => {
  const item = await prisma.department.findUnique({
    where: { id: req.params.id },
    include: { categories: { select: { id: true, name: true } }, head: { select: { id: true, name: true, email: true } } }
  })
  if (!item) return fail(res, 404, 'Department not found')
  ok(res, { department: item })
}

export const createDepartment = async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return fail(res, 400, 'Invalid input', errors.array())
  const { name, description, code, contactEmail, contactPhone, slaHours, isActive } = req.body
  try {
    const dep = await prisma.department.create({ data: {
      name, description: description || '', code,
      contactEmail: contactEmail || null, contactPhone: contactPhone || null,
      slaHours: typeof slaHours === 'number' ? slaHours : undefined,
      isActive: typeof isActive === 'boolean' ? isActive : undefined,
    } })
    created(res, { department: dep })
  } catch (e) {
    if (e && e.code === 'P2002') return fail(res, 409, 'Department name or code already exists')
    throw e
  }
}

export const updateDepartment = async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return fail(res, 400, 'Invalid input', errors.array())
  const { name, description, contactEmail, contactPhone, slaHours, isActive, priority, budget } = req.body
  try {
    const dep = await prisma.department.update({
      where: { id: req.params.id },
      data: {
        name: name ?? undefined,
        description: description ?? undefined,
        contactEmail: contactEmail ?? undefined,
        contactPhone: contactPhone ?? undefined,
        slaHours: typeof slaHours === 'number' ? slaHours : undefined,
        isActive: typeof isActive === 'boolean' ? isActive : undefined,
        priority: typeof priority === 'number' ? priority : undefined,
        budget: typeof budget === 'number' ? budget : undefined,
      },
    })
    ok(res, { department: dep })
  } catch (e) {
    if (e && e.code === 'P2025') return fail(res, 404, 'Department not found')
    if (e && e.code === 'P2002') return fail(res, 409, 'Department name or code already exists')
    throw e
  }
}

/**
 * Soft delete a department
 */
export const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    
    const department = await prisma.department.findUnique({
      where: { id }
    });
    
    if (!department) {
      return fail(res, 404, 'Department not found');
    }
    
    const updated = await prisma.department.update({
      where: { id },
      data: { isActive: false }
    });
    
    await prisma.activityLog.create({
      data: {
        userId: req.user.id,
        action: 'DELETED',
        description: `Department "${department.name}" softly deleted`,
        metadata: { departmentId: id }
      }
    });
    
    return ok(res, { message: 'Department successfully deleted', department: updated });
  } catch (error) {
    logger.error('Error deleting department', { error: error.message, id: req.params.id });
    return fail(res, 500, 'Failed to delete department');
  }
}

/**
 * Get all issues assigned to a department
 */
export const getDepartmentIssues = async (req, res) => {
  try {
    const { id: departmentId } = req.params
    const { status, priority, page = 1, limit = 20 } = req.query
    
    // Verify user has access to this department
    const user = req.user
    const department = await prisma.department.findUnique({
      where: { id: departmentId },
      select: { id: true, headId: true, name: true }
    })
    
    if (!department) {
      return fail(res, 404, 'Department not found')
    }
    
    // Check authorization: must be dept head, super_admin, or mayor
    const isAuthorized = 
      department.headId === user.id ||
      (user.roles.includes('dept_admin') && user.departmentId === departmentId) ||
      (user.roles.includes('staff') && user.departmentId === departmentId) ||
      user.roles.includes('super_admin') ||
      user.roles.includes('mayor')
    
    if (!isAuthorized) {
      return fail(res, 403, 'Not authorized to view this department')
    }
    
    // Build query
    const where = {
      departmentId,
      ...(status && { status: status.toUpperCase() }),
      ...(priority && { priority: priority.toUpperCase() })
    }
    
    const [issues, total] = await Promise.all([
      prisma.issue.findMany({
        where,
        include: {
          reporter: { select: { id: true, name: true, email: true } },
          assignedTo: { select: { id: true, name: true, email: true } },
          category: { select: { id: true, name: true } },
          images: { select: { id: true, url: true, filename: true } },
          timeline: {
            orderBy: { createdAt: 'desc' },
            take: 5
          }
        },
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'asc' }
        ],
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit)
      }),
      prisma.issue.count({ where })
    ])
    
    return ok(res, {
      issues,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    })
    
  } catch (error) {
    logger.error('Error fetching department issues', {
      error: error.message,
      departmentId: req.params.id
    })
    return fail(res, 500, 'Failed to fetch department issues')
  }
}

/**
 * Get all staff members in a department
 */
export const getDepartmentStaff = async (req, res) => {
  try {
    const { id: departmentId } = req.params
    
    // Verify user has access
    const department = await prisma.department.findUnique({
      where: { id: departmentId },
      select: { id: true, headId: true }
    })
    
    if (!department) {
      return fail(res, 404, 'Department not found')
    }
    
    const isAuthorized = 
      department.headId === req.user.id ||
      (req.user.roles.includes('dept_admin') && req.user.departmentId === departmentId) ||
      req.user.roles.includes('super_admin') ||
      req.user.roles.includes('mayor')
    
    if (!isAuthorized) {
      return fail(res, 403, 'Not authorized')
    }
    
    // Get staff members
    const staff = await prisma.user.findMany({
      where: {
        departmentId,
        roles: { has: 'staff' },
        isActive: true
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        roles: true,
        createdAt: true,
        _count: {
          select: {
            assignedIssues: {
              where: {
                status: { in: ['ASSIGNED_TO_STAFF', 'IN_PROGRESS'] }
              }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    })
    
    // Enhance with workload info
    const staffWithWorkload = staff.map(s => ({
      ...s,
      activeIssues: s._count.assignedIssues,
      workloadStatus: s._count.assignedIssues === 0 ? 'available' : 
                      s._count.assignedIssues < 3 ? 'light' :
                      s._count.assignedIssues < 6 ? 'moderate' : 'heavy'
    }))
    
    return ok(res, { staff: staffWithWorkload })
    
  } catch (error) {
    logger.error('Error fetching department staff', {
      error: error.message,
      departmentId: req.params.id
    })
    return fail(res, 500, 'Failed to fetch staff')
  }
}

/**
 * Assign issue to staff member (Department Admin only)
 */
export const assignIssueToStaff = async (req, res) => {
  try {
    const { issueId } = req.params
    const { staffUserId, note } = req.body
    const deptAdminId = req.user.id
    
    if (!staffUserId) {
      return fail(res, 400, 'staffUserId is required')
    }
    
    // Get issue with department info
    const issue = await prisma.issue.findUnique({
      where: { id: issueId },
      include: { 
        department: { select: { id: true, headId: true, name: true } }
      }
    })
    
    if (!issue) {
      return fail(res, 404, 'Issue not found')
    }
    
    if (!issue.departmentId) {
      return fail(res, 400, 'Issue not assigned to any department')
    }
    
    // Verify authorization: must be dept head, super_admin, or mayor
    const isAuthorized = 
      issue.department.headId === deptAdminId ||
      (req.user.roles.includes('dept_admin') && req.user.departmentId === issue.departmentId) ||
      req.user.roles.includes('super_admin') ||
      req.user.roles.includes('mayor')
    
    if (!isAuthorized) {
      return fail(res, 403, 'Not authorized to assign issues in this department')
    }
    
    // Verify staff belongs to this department
    const staff = await prisma.user.findUnique({
      where: { id: staffUserId },
      select: { 
        id: true, 
        name: true,
        departmentId: true, 
        roles: true,
        isActive: true
      }
    })
    
    if (!staff) {
      return fail(res, 404, 'Staff member not found')
    }
    
    if (!staff.isActive) {
      return fail(res, 400, 'Staff member is not active')
    }
    
    if (staff.departmentId !== issue.departmentId) {
      return fail(res, 400, 'Staff does not belong to this department')
    }
    
    if (!staff.roles.includes('staff')) {
      return fail(res, 400, 'User is not a staff member')
    }
    
    // Assign to staff
    const updated = await prisma.issue.update({
      where: { id: issueId },
      data: {
        assignedToId: staffUserId,
        status: 'ASSIGNED_TO_STAFF',
        assignedToStaffAt: new Date(),
        timeline: {
          create: {
            status: 'ASSIGNED_TO_STAFF',
            note: note || `Assigned to ${staff.name} by department admin`,
            performedById: deptAdminId
          }
        }
      },
      include: {
        assignedTo: { select: { id: true, name: true } },
        department: { select: { id: true, name: true } }
      }
    })
    
    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: deptAdminId,
        action: 'ASSIGNED',
        issueId: updated.id,
        description: `Issue assigned to staff member ${staff.name}`,
        metadata: { staffUserId, departmentId: issue.departmentId }
      }
    })
    
    // Real-time notifications
    try {
      const io = req.app.get('io')
      
      // Notify staff member
      io.to(`user:${staffUserId}`).emit('issue:assigned', {
        id: updated.id,
        title: updated.title,
        priority: updated.priority,
        department: updated.department?.name
      })
      
      // Update issue status
      io.emit('issue:status', { 
        id: updated.id, 
        status: 'ASSIGNED_TO_STAFF' 
      })
      
      // Update department stats
      if (updated.departmentId) {
        emitDepartmentStats(io, updated.departmentId)
      }
    } catch (error) {
      logger.warn('Failed to emit socket events for staff assignment', {
        error: error.message,
        issueId: updated.id
      })
    }
    
    logger.info('Issue assigned to staff by department admin', {
      issueId: updated.id,
      staffId: staffUserId,
      departmentId: issue.departmentId,
      assignedBy: deptAdminId
    })
    
    return ok(res, { issue: updated })
    
  } catch (error) {
    logger.error('Error assigning issue to staff', {
      error: error.message,
      stack: error.stack,
      issueId: req.params.issueId
    })
    return fail(res, 500, 'Failed to assign issue to staff')
  }
}
