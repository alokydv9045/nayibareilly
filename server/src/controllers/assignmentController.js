import prisma from '../config/prisma.js';
import * as notificationService from '../services/notificationService.js';

/**
 * Helper function to create notifications (DEPRECATED - use notificationService)
 */
const createNotification = async ({ userId, type, title, message, issueId, link }) => {
  try {
    await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        issueId,
        link,
        read: false
      }
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    // Don't throw - notification failure shouldn't break assignment
  }
};

/**
 * Helper function to log activities
 */
const logActivity = async ({ userId, action, entityType, entityId, details }) => {
  try {
    await prisma.activityLog.create({
      data: {
        userId,
        action,
        entityType,
        entityId,
        details
      }
    });
  } catch (error) {
    console.error('Error logging activity:', error);
    // Don't throw - logging failure shouldn't break assignment
  }
};

/**
 * Assign an issue to a staff member
 * POST /api/issues/:id/assign
 */
export const assignIssue = async (req, res) => {
  try {
    const { id: issueId } = req.params;
    const { assigneeId, priority, notes } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!assigneeId) {
      return res.status(400).json({ 
        success: false,
        message: 'Assignee ID is required' 
      });
    }

    // Get the issue
    const issue = await prisma.issue.findUnique({
      where: { id: issueId },
      include: {
        assignedTo: true,
        reporter: true,
        category: true,
        department: true
      }
    });

    if (!issue) {
      return res.status(404).json({ 
        success: false,
        message: 'Issue not found' 
      });
    }

    // Check if already assigned
    if (issue.assignedToId) {
      return res.status(400).json({ 
        success: false,
        message: 'Issue is already assigned. Use reassign endpoint to change assignment.' 
      });
    }

    // Get the assignee
    const assignee = await prisma.user.findUnique({
      where: { id: assigneeId },
      select: {
        id: true,
        name: true,
        email: true,
        roles: true,
        departmentId: true,
        isActive: true
      }
    });

    if (!assignee) {
      return res.status(404).json({ 
        success: false,
        message: 'Assignee not found' 
      });
    }

    // Validate assignee is staff
    if (!assignee.roles.includes('staff') && !assignee.roles.includes('moderator')) {
      return res.status(400).json({ 
        success: false,
        message: 'Assignee must be a staff member or moderator' 
      });
    }

    // Check if assignee is active
    if (!assignee.isActive) {
      return res.status(400).json({ 
        success: false,
        message: 'Assignee is not active' 
      });
    }

    // Get current user info
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true }
    });

    // Update the issue
    const updatedIssue = await prisma.issue.update({
      where: { id: issueId },
      data: {
        assignedToId: assigneeId,
        assignedToStaffAt: new Date(),
        moderatorId: userId,
        moderatorNotes: notes,
        moderatedAt: new Date(),
        moderationStatus: 'ASSIGNED',
        priority: priority || issue.priority,
        status: 'ASSIGNED',
        updatedAt: new Date()
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            departmentId: true
          }
        },
        reporter: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Create assignment history record
    await prisma.assignmentHistory.create({
      data: {
        issueId: issue.id,
        issueReportId: issue.reportId,
        toAssigneeId: assigneeId,
        toAssigneeName: assignee.name,
        changedById: userId,
        changedByName: currentUser?.name || 'System',
        type: 'INITIAL',
        priority: priority || issue.priority,
        notes: notes,
        createdAt: new Date()
      }
    });

    // Create timeline entry
    await prisma.issueTimeline.create({
      data: {
        issueId: issue.id,
        userId: userId,
        action: 'ASSIGNED',
        description: `Issue assigned to ${assignee.name}`,
        metadata: JSON.stringify({
          assigneeId,
          assigneeName: assignee.name,
          priority: priority || issue.priority,
          notes
        })
      }
    });

    // Log activity
    await logActivity({
      userId,
      action: 'ISSUE_ASSIGNED',
      entityType: 'issue',
      entityId: issue.id,
      details: `Assigned issue "${issue.title}" to ${assignee.name}`
    });

    // Create notification for assignee using new notification service
    await notificationService.notifyIssueAssignment(
      issue.id,
      assigneeId,
      userId
    );

    // Notify reporter using new notification service
    if (issue.reporterId && issue.reporterId !== userId) {
      await notificationService.createNotification({
        userId: issue.reporterId,
        title: 'Issue Assigned',
        message: `Your issue "${issue.title}" has been assigned to staff`,
        type: 'INFO',
        category: 'issue_status',
        relatedIssueId: issue.id,
        actionUrl: `/issue/${issue.id}`,
        priority: 'NORMAL'
      });
    }

    res.json({
      success: true,
      message: 'Issue assigned successfully',
      data: {
        id: updatedIssue.id,
        issueId: updatedIssue.id,
        assigneeId: updatedIssue.assignedToId,
        assigneeName: updatedIssue.assignedTo?.name,
        assignedBy: userId,
        assignedAt: updatedIssue.assignedToStaffAt,
        department: updatedIssue.assignedTo?.departmentId,
        status: 'active',
        priority: updatedIssue.priority,
        notes: notes
      }
    });

  } catch (error) {
    console.error('Error assigning issue:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to assign issue',
      error: error.message 
    });
  }
};

/**
 * Reassign an issue to a different staff member
 * POST /api/issues/:id/reassign
 */
export const reassignIssue = async (req, res) => {
  try {
    const { id: issueId } = req.params;
    const { newAssigneeId, reason } = req.body;
    const userId = req.user.id;

    if (!newAssigneeId || !reason) {
      return res.status(400).json({ 
        success: false,
        message: 'New assignee ID and reason are required' 
      });
    }

    // Get the issue
    const issue = await prisma.issue.findUnique({
      where: { id: issueId },
      include: {
        assignedTo: true
      }
    });

    if (!issue) {
      return res.status(404).json({ 
        success: false,
        message: 'Issue not found' 
      });
    }

    if (!issue.assignedToId) {
      return res.status(400).json({ 
        success: false,
        message: 'Issue is not currently assigned' 
      });
    }

    // Get new assignee
    const newAssignee = await prisma.user.findUnique({
      where: { id: newAssigneeId },
      select: {
        id: true,
        name: true,
        email: true,
        roles: true,
        isActive: true
      }
    });

    if (!newAssignee) {
      return res.status(404).json({ 
        success: false,
        message: 'New assignee not found' 
      });
    }

    if (!newAssignee.roles.includes('staff') && !newAssignee.roles.includes('moderator')) {
      return res.status(400).json({ 
        success: false,
        message: 'New assignee must be a staff member or moderator' 
      });
    }

    if (!newAssignee.isActive) {
      return res.status(400).json({ 
        success: false,
        message: 'New assignee is not active' 
      });
    }

    // Get current user info
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true }
    });

    const oldAssigneeId = issue.assignedToId;
    const oldAssigneeName = issue.assignedTo?.name || 'Unknown';

    // Update the issue
    const updatedIssue = await prisma.issue.update({
      where: { id: issueId },
      data: {
        assignedToId: newAssigneeId,
        assignedToStaffAt: new Date(),
        updatedAt: new Date()
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Create reassignment history
    await prisma.assignmentHistory.create({
      data: {
        issueId: issue.id,
        issueReportId: issue.reportId,
        fromAssigneeId: oldAssigneeId,
        fromAssigneeName: oldAssigneeName,
        toAssigneeId: newAssigneeId,
        toAssigneeName: newAssignee.name,
        changedById: userId,
        changedByName: currentUser?.name || 'System',
        type: 'REASSIGNMENT',
        reason: reason,
        createdAt: new Date()
      }
    });

    // Create timeline entry
    await prisma.issueTimeline.create({
      data: {
        issueId: issue.id,
        userId: userId,
        action: 'REASSIGNED',
        description: `Issue reassigned from ${oldAssigneeName} to ${newAssignee.name}`,
        metadata: JSON.stringify({
          fromAssigneeId: oldAssigneeId,
          fromAssigneeName: oldAssigneeName,
          toAssigneeId: newAssigneeId,
          toAssigneeName: newAssignee.name,
          reason
        })
      }
    });

    // Log activity
    await logActivity({
      userId,
      action: 'ISSUE_REASSIGNED',
      entityType: 'issue',
      entityId: issue.id,
      details: `Reassigned issue from ${oldAssigneeName} to ${newAssignee.name}. Reason: ${reason}`
    });

    // Notify new assignee
    await createNotification({
      userId: newAssigneeId,
      type: 'ISSUE_ASSIGNED',
      title: 'Issue Reassigned to You',
      message: `Issue "${issue.title}" has been reassigned to you`,
      issueId: issue.id,
      link: `/staff/issues/${issue.id}`
    });

    // Notify old assignee
    await createNotification({
      userId: oldAssigneeId,
      type: 'ISSUE_UPDATE',
      title: 'Issue Reassigned',
      message: `Issue "${issue.title}" has been reassigned to ${newAssignee.name}`,
      issueId: issue.id,
      link: `/staff/issues/${issue.id}`
    });

    res.json({
      success: true,
      message: 'Issue reassigned successfully',
      data: {
        id: updatedIssue.id,
        issueId: updatedIssue.id,
        assigneeId: updatedIssue.assignedToId,
        assigneeName: updatedIssue.assignedTo?.name,
        assignedBy: userId,
        assignedAt: updatedIssue.assignedToStaffAt,
        status: 'active',
        priority: updatedIssue.priority
      }
    });

  } catch (error) {
    console.error('Error reassigning issue:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to reassign issue',
      error: error.message 
    });
  }
};

/**
 * Unassign an issue
 * POST /api/issues/:id/unassign
 */
export const unassignIssue = async (req, res) => {
  try {
    const { id: issueId } = req.params;
    const { reason } = req.body;
    const userId = req.user.id;

    if (!reason) {
      return res.status(400).json({ 
        success: false,
        message: 'Reason is required for unassignment' 
      });
    }

    // Get the issue
    const issue = await prisma.issue.findUnique({
      where: { id: issueId },
      include: {
        assignedTo: true
      }
    });

    if (!issue) {
      return res.status(404).json({ 
        success: false,
        message: 'Issue not found' 
      });
    }

    if (!issue.assignedToId) {
      return res.status(400).json({ 
        success: false,
        message: 'Issue is not currently assigned' 
      });
    }

    // Get current user info
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true }
    });

    const oldAssigneeId = issue.assignedToId;
    const oldAssigneeName = issue.assignedTo?.name || 'Unknown';

    // Update the issue
    await prisma.issue.update({
      where: { id: issueId },
      data: {
        assignedToId: null,
        assignedToStaffAt: null,
        status: 'PENDING',
        moderationStatus: 'PENDING_ASSIGNMENT',
        updatedAt: new Date()
      }
    });

    // Create unassignment history
    await prisma.assignmentHistory.create({
      data: {
        issueId: issue.id,
        issueReportId: issue.reportId,
        fromAssigneeId: oldAssigneeId,
        fromAssigneeName: oldAssigneeName,
        toAssigneeId: oldAssigneeId, // Keep track of who was unassigned
        toAssigneeName: 'Unassigned',
        changedById: userId,
        changedByName: currentUser?.name || 'System',
        type: 'UNASSIGNMENT',
        reason: reason,
        createdAt: new Date()
      }
    });

    // Create timeline entry
    await prisma.issueTimeline.create({
      data: {
        issueId: issue.id,
        userId: userId,
        action: 'UNASSIGNED',
        description: `Issue unassigned from ${oldAssigneeName}`,
        metadata: JSON.stringify({
          fromAssigneeId: oldAssigneeId,
          fromAssigneeName: oldAssigneeName,
          reason
        })
      }
    });

    // Log activity
    await logActivity({
      userId,
      action: 'ISSUE_UNASSIGNED',
      entityType: 'issue',
      entityId: issue.id,
      details: `Unassigned issue from ${oldAssigneeName}. Reason: ${reason}`
    });

    // Notify old assignee
    await createNotification({
      userId: oldAssigneeId,
      type: 'ISSUE_UPDATE',
      title: 'Issue Unassigned',
      message: `Issue "${issue.title}" has been unassigned from you`,
      issueId: issue.id,
      link: `/staff/issues/${issue.id}`
    });

    res.json({
      success: true,
      message: 'Issue unassigned successfully'
    });

  } catch (error) {
    console.error('Error unassigning issue:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to unassign issue',
      error: error.message 
    });
  }
};

/**
 * Get current assignment for an issue
 * GET /api/issues/:id/assignment
 */
export const getCurrentAssignment = async (req, res) => {
  try {
    const { id: issueId } = req.params;

    const issue = await prisma.issue.findUnique({
      where: { id: issueId },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            departmentId: true
          }
        },
        department: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!issue) {
      return res.status(404).json({ 
        success: false,
        message: 'Issue not found' 
      });
    }

    if (!issue.assignedToId) {
      return res.status(404).json({ 
        success: false,
        message: 'Issue is not currently assigned' 
      });
    }

    res.json({
      success: true,
      data: {
        id: issue.id,
        issueId: issue.id,
        assigneeId: issue.assignedToId,
        assigneeName: issue.assignedTo?.name,
        assignedBy: issue.moderatorId,
        assignedAt: issue.assignedToStaffAt,
        department: issue.department?.name,
        status: 'active',
        priority: issue.priority,
        notes: issue.moderatorNotes
      }
    });

  } catch (error) {
    console.error('Error getting assignment:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to get assignment',
      error: error.message 
    });
  }
};

/**
 * Get assignment history for an issue
 * GET /api/issues/:id/assignment-history
 */
export const getAssignmentHistory = async (req, res) => {
  try {
    const { id: issueId } = req.params;

    const history = await prisma.assignmentHistory.findMany({
      where: { issueId },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: history.map(entry => ({
        id: entry.id,
        issueId: entry.issueId,
        fromAssigneeId: entry.fromAssigneeId,
        fromAssigneeName: entry.fromAssigneeName,
        toAssigneeId: entry.toAssigneeId,
        toAssigneeName: entry.toAssigneeName,
        changedBy: entry.changedById,
        changedByName: entry.changedByName,
        changedAt: entry.createdAt,
        reason: entry.reason,
        type: entry.type.toLowerCase()
      }))
    });

  } catch (error) {
    console.error('Error getting assignment history:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to get assignment history',
      error: error.message 
    });
  }
};

/**
 * Get staff list with workload
 * GET /api/staff
 */
export const getStaffList = async (req, res) => {
  try {
    const { department, available } = req.query;

    const where = {
      roles: { has: 'staff' },
      isActive: true
    };

    if (department) {
      where.departmentId = department;
    }

    const staff = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        roles: true,
        departmentId: true,
        isActive: true,
        assignedIssues: {
          where: {
            status: {
              notIn: ['CLOSED', 'RESOLVED', 'REJECTED']
            }
          },
          select: {
            id: true
          }
        },
        department: {
          select: {
            name: true
          }
        }
      }
    });

    // Calculate workload and format response
    const staffWithWorkload = staff.map(member => {
      const currentWorkload = member.assignedIssues.length;
      const maxCapacity = 20; // Default capacity, can be made configurable
      const isAvailable = currentWorkload < maxCapacity;

      return {
        id: member.id,
        name: member.name,
        email: member.email,
        role: member.roles.includes('staff') ? 'staff' : 'moderator',
        department: member.departmentId || 'general_admin',
        specializations: ['general'], // Can be extended with actual specializations
        currentWorkload,
        maxCapacity,
        isAvailable: member.isActive && isAvailable,
        skills: [], // Can be extended with actual skills
        experienceYears: 0 // Can be extended with actual experience
      };
    });

    // Filter by availability if requested
    const filteredStaff = available === 'true' 
      ? staffWithWorkload.filter(s => s.isAvailable)
      : staffWithWorkload;

    res.json({
      success: true,
      data: filteredStaff
    });

  } catch (error) {
    console.error('Error getting staff list:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to get staff list',
      error: error.message 
    });
  }
};

/**
 * Get workload for a specific staff member
 * GET /api/staff/:id/workload
 */
export const getStaffWorkload = async (req, res) => {
  try {
    const { id: staffId } = req.params;

    const staff = await prisma.user.findUnique({
      where: { id: staffId },
      select: {
        id: true,
        name: true,
        departmentId: true,
        assignedIssues: {
          where: {
            status: {
              notIn: ['CLOSED', 'REJECTED']
            }
          },
          select: {
            id: true,
            reportId: true,
            title: true,
            status: true,
            assignedToStaffAt: true,
            resolvedAt: true
          },
          orderBy: {
            assignedToStaffAt: 'desc'
          }
        }
      }
    });

    if (!staff) {
      return res.status(404).json({ 
        success: false,
        message: 'Staff member not found' 
      });
    }

    const activeIssues = staff.assignedIssues.filter(
      issue => !['CLOSED', 'RESOLVED', 'REJECTED'].includes(issue.status)
    );

    const completedIssues = staff.assignedIssues.filter(
      issue => ['CLOSED', 'RESOLVED'].includes(issue.status)
    );

    // Calculate metrics
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const completedThisWeek = completedIssues.filter(
      issue => issue.resolvedAt && issue.resolvedAt >= oneWeekAgo
    ).length;

    const completedThisMonth = completedIssues.filter(
      issue => issue.resolvedAt && issue.resolvedAt >= oneMonthAgo
    ).length;

    const maxCapacity = 20;
    const currentWorkload = activeIssues.length;
    const capacityUtilization = (currentWorkload / maxCapacity) * 100;

    res.json({
      success: true,
      data: {
        staffId: staff.id,
        staffName: staff.name,
        department: staff.departmentId || 'general_admin',
        currentWorkload,
        maxCapacity,
        metrics: {
          totalAssignments: staff.assignedIssues.length,
          activeAssignments: activeIssues.length,
          completedThisWeek,
          completedThisMonth,
          averageCompletionTime: 48, // Can be calculated from actual data
          capacityUtilization,
          status: capacityUtilization < 40 ? 'available' : 
                  capacityUtilization < 70 ? 'moderate' : 
                  capacityUtilization < 100 ? 'heavy' : 'full'
        },
        recentAssignments: staff.assignedIssues.slice(0, 5).map(issue => ({
          issueId: issue.id,
          title: issue.title,
          assignedAt: issue.assignedToStaffAt,
          status: issue.status
        }))
      }
    });

  } catch (error) {
    console.error('Error getting staff workload:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to get staff workload',
      error: error.message 
    });
  }
};
