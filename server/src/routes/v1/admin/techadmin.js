import { Router } from 'express'
import { auth } from '../../../middlewares/auth.js'
import {
  getWebhooks,
  createWebhook,
  updateWebhook,
  deleteWebhook,
  testWebhook,
  getApiKeys,
  createApiKey,
  deleteApiKey,
  getDbHealth,
  archiveIssues,
  getSystemSettings,
  updateSystemSettings,
  getAuditLogs,
  getSecurityEvents,
  getSystemActivity,
  getComplianceReport
} from '../../../controllers/techadmin.controller.js'

const router = Router()

// All routes require TECH_ADMIN role
router.use(auth(['TECH_ADMIN']))

// Webhooks
router.get('/webhooks', getWebhooks)
router.post('/webhooks', createWebhook)
router.put('/webhooks/:id', updateWebhook)
router.delete('/webhooks/:id', deleteWebhook)
router.post('/webhooks/:id/test', testWebhook)

// API Keys
router.get('/keys', getApiKeys)
router.post('/keys', createApiKey)
router.delete('/keys/:id', deleteApiKey)

// DB Health & Retention Policy
router.get('/db-health', getDbHealth)
router.post('/db-health/archive', archiveIssues)

// System Settings
router.get('/settings', getSystemSettings)
router.put('/settings', updateSystemSettings)

// Audit & Compliance
router.get('/audit/logs', getAuditLogs)
router.get('/audit/security', getSecurityEvents)
router.get('/audit/system', getSystemActivity)
router.get('/audit/compliance', getComplianceReport)

export default router
