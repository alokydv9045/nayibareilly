/**
 * Sessions Routes - API v1
 * User session management endpoints
 * @module routes/v1/sessions
 */

import { Router } from 'express';
import { param } from 'express-validator';
import { auth } from '../../../middlewares/auth.js';
import {
  getUserSessions,
  revokeSession,
  revokeAllOtherSessions,
  revokeAllSessions,
  getSessionStats
} from '../../../controllers/session.controller.js';

const router = Router();

/**
 * GET /api/v1/sessions
 * Get all sessions for current user
 */
router.get('/', [
  auth()
], getUserSessions);

/**
 * GET /api/v1/sessions/stats
 * Get session statistics for current user
 */
router.get('/stats', [
  auth()
], getSessionStats);

/**
 * DELETE /api/v1/sessions/:id
 * Revoke a specific session
 */
router.delete('/:id', [
  auth(),
  param('id').isNumeric()
], revokeSession);

/**
 * POST /api/v1/sessions/revoke-others
 * Revoke all other sessions except current
 */
router.post('/revoke-others', [
  auth()
], revokeAllOtherSessions);

/**
 * POST /api/v1/sessions/revoke-all
 * Revoke all sessions including current (force logout)
 */
router.post('/revoke-all', [
  auth()
], revokeAllSessions);

export default router;
