/**
 * API Version 1 Routes
 * Enterprise-grade modular route structure
 * @module routes/v1
 */

import { Router } from 'express';

// Import modular route groups
import publicRoutes from './public/index.js';
import authRoutes from './auth/index.js';
import issuesRoutes from './issues/index.js';
import usersRoutes from './users/index.js';
import adminRoutes from './admin/index.js';
import departmentsRoutes from './departments/index.js';
import notificationsRoutes from './notifications/index.js';
import sessionsRoutes from './sessions/index.js';
import moderatorRoutes from './moderator/index.js';
import voiceNotesRoutes from './voiceNotes.js';

const router = Router();

/**
 * Mount v1 routes with proper structure
 */

// Public routes (no authentication required)
router.use('/public', publicRoutes);

// Authentication routes
router.use('/auth', authRoutes);

// Issue management routes
router.use('/issues', issuesRoutes);

// User management routes
router.use('/users', usersRoutes);

// Admin routes
router.use('/admin', adminRoutes);

// Department routes
router.use('/departments', departmentsRoutes);

// Notification routes
router.use('/notifications', notificationsRoutes);

// Session management routes
router.use('/sessions', sessionsRoutes);

// Moderator routes
router.use('/moderator', moderatorRoutes);

// Voice notes routes
router.use('/issues', voiceNotesRoutes);

/**
 * API Version Info
 * GET /api/v1
 */
router.get('/', (req, res) => {
  res.json({
    version: '1.0.0',
    status: 'active',
    endpoints: {
      public: '/api/v1/public',
      auth: '/api/v1/auth',
      issues: '/api/v1/issues',
      users: '/api/v1/users',
      admin: '/api/v1/admin',
      departments: '/api/v1/departments',
      notifications: '/api/v1/notifications',
      sessions: '/api/v1/sessions',
      moderator: '/api/v1/moderator',
      voiceNotes: '/api/v1/issues/:issueId/voice-notes',
      health: '/api/v1/health'
    },
    documentation: '/api/v1/docs',
    message: 'NayiBareilly API v1 - Enterprise Grade'
  });
});

export default router;
