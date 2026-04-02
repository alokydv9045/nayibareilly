-- Database Performance Optimization Script
-- Run these commands to add performance indexes to existing database

-- Issues table optimizations
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_issues_status ON "Issue" (status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_issues_priority ON "Issue" (priority);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_issues_created_at ON "Issue" ("createdAt" DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_issues_updated_at ON "Issue" ("updatedAt" DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_issues_reporter_id ON "Issue" ("reporterId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_issues_category_id ON "Issue" ("categoryId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_issues_department_id ON "Issue" ("departmentId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_issues_status_priority ON "Issue" (status, priority);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_issues_status_created ON "Issue" (status, "createdAt" DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_issues_category_status ON "Issue" ("categoryId", status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_issues_department_status ON "Issue" ("departmentId", status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_issues_reporter_status ON "Issue" ("reporterId", status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_issues_public_status ON "Issue" ("isPublic", status) WHERE "isPublic" = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_issues_anonymous ON "Issue" ("isAnonymous");

-- Full-text search indexes for issues
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_issues_title_gin ON "Issue" USING gin(to_tsvector('english', title));
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_issues_description_gin ON "Issue" USING gin(to_tsvector('english', description));
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_issues_address_gin ON "Issue" USING gin(to_tsvector('english', address));

-- Composite search index
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_issues_search_composite ON "Issue" USING gin(
  (setweight(to_tsvector('english', title), 'A') ||
   setweight(to_tsvector('english', description), 'B') ||
   setweight(to_tsvector('english', COALESCE(address, '')), 'C'))
);

-- Geographic/spatial indexes for location-based queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_issues_location ON "Issue" (latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_issues_ward ON "Issue" (ward) WHERE ward IS NOT NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_issues_zone ON "Issue" (zone) WHERE zone IS NOT NULL;

-- Users table optimizations
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email ON "User" (email);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_role ON "User" (role);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_active ON "User" ("isActive");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_verified ON "User" ("isVerified");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_role_active ON "User" (role, "isActive");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_department_id ON "User" ("departmentId") WHERE "departmentId" IS NOT NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_created_at ON "User" ("createdAt" DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_login_attempts ON "User" ("loginAttempts") WHERE "loginAttempts" > 0;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_locked_until ON "User" ("lockedUntil") WHERE "lockedUntil" IS NOT NULL;

-- Issue Timeline optimizations
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_issue_timeline_issue_id ON "IssueTimeline" ("issueId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_issue_timeline_created_at ON "IssueTimeline" ("createdAt" DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_issue_timeline_status ON "IssueTimeline" (status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_issue_timeline_performed_by ON "IssueTimeline" ("performedById");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_issue_timeline_issue_created ON "IssueTimeline" ("issueId", "createdAt" DESC);

-- Issue Media optimizations
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_issue_media_issue_id ON "IssueMedia" ("issueId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_issue_media_created_at ON "IssueMedia" ("createdAt" DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_issue_media_mime_type ON "IssueMedia" ("mimeType");

-- Issue Comments optimizations
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_issue_comments_issue_id ON "IssueComment" ("issueId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_issue_comments_author_id ON "IssueComment" ("authorId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_issue_comments_created_at ON "IssueComment" ("createdAt" DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_issue_comments_active ON "IssueComment" ("isActive");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_issue_comments_issue_active ON "IssueComment" ("issueId", "isActive", "createdAt" DESC);

-- Issue Votes optimizations
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_issue_votes_issue_id ON "IssueVote" ("issueId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_issue_votes_user_id ON "IssueVote" ("userId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_issue_votes_type ON "IssueVote" (type);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_issue_votes_created_at ON "IssueVote" ("createdAt" DESC);

-- Notifications optimizations
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_user_id ON "Notification" ("userId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_read ON "Notification" ("isRead");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_type ON "Notification" (type);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_created_at ON "Notification" ("createdAt" DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_user_unread ON "Notification" ("userId", "isRead", "createdAt" DESC) WHERE "isRead" = false;

-- Categories and Departments optimizations
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_categories_active ON "IssueCategory" ("isActive");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_categories_name ON "IssueCategory" (name);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_departments_active ON "Department" ("isActive");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_departments_name ON "Department" (name);

-- Refresh Tokens optimizations
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_refresh_tokens_user_id ON "RefreshToken" ("userId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_refresh_tokens_expires_at ON "RefreshToken" ("expiresAt");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_refresh_tokens_user_expires ON "RefreshToken" ("userId", "expiresAt");

-- Audit Logs optimizations
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_user_id ON "AuditLog" ("userId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_action ON "AuditLog" (action);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_resource ON "AuditLog" ("resourceType", "resourceId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_created_at ON "AuditLog" ("createdAt" DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_ip_address ON "AuditLog" ("ipAddress");

-- Performance monitoring and statistics
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_issues_view_count ON "Issue" ("viewCount" DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_issues_votes ON "Issue" ("totalVotes" DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_issues_upvotes ON "Issue" ("upvotes" DESC);

-- Partial indexes for common queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_issues_pending ON "Issue" ("createdAt" DESC) WHERE status = 'PENDING';
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_issues_in_progress ON "Issue" ("updatedAt" DESC) WHERE status = 'IN_PROGRESS';
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_issues_resolved ON "Issue" ("updatedAt" DESC) WHERE status = 'RESOLVED';
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_issues_high_priority ON "Issue" ("createdAt" DESC) WHERE priority = 'HIGH' OR priority = 'CRITICAL';

-- Covering indexes for frequently accessed columns
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_issues_list_covering ON "Issue" 
  ("createdAt" DESC) 
  INCLUDE (id, "reportId", title, status, priority, "categoryId", "departmentId", "isAnonymous", "viewCount", "upvotes", "downvotes");

-- Dashboard analytics optimizations
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_issues_analytics_date ON "Issue" (DATE("createdAt"), status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_issues_analytics_category ON "Issue" ("categoryId", status, "createdAt");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_issues_analytics_department ON "Issue" ("departmentId", status, "createdAt");

-- Database maintenance views for monitoring
CREATE OR REPLACE VIEW issue_performance_stats AS
SELECT 
  COUNT(*) as total_issues,
  COUNT(*) FILTER (WHERE status = 'PENDING') as pending_issues,
  COUNT(*) FILTER (WHERE status = 'IN_PROGRESS') as in_progress_issues,
  COUNT(*) FILTER (WHERE status = 'RESOLVED') as resolved_issues,
  COUNT(*) FILTER (WHERE priority = 'HIGH' OR priority = 'CRITICAL') as high_priority_issues,
  AVG("viewCount") as avg_view_count,
  AVG("totalVotes") as avg_total_votes,
  DATE_TRUNC('day', NOW()) as computed_date
FROM "Issue"
WHERE "createdAt" >= NOW() - INTERVAL '30 days';

-- Index usage monitoring query (for database administrators)
-- Run this periodically to monitor index performance
-- SELECT 
--   schemaname,
--   tablename,
--   indexname,
--   idx_scan,
--   idx_tup_read,
--   idx_tup_fetch
-- FROM pg_stat_user_indexes 
-- WHERE schemaname = 'public'
-- ORDER BY idx_scan DESC;

-- Table size monitoring
-- SELECT 
--   schemaname,
--   tablename,
--   pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
--   pg_total_relation_size(schemaname||'.'||tablename) as size_bytes
-- FROM pg_tables 
-- WHERE schemaname = 'public'
-- ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Analyze all tables to update statistics
ANALYZE "Issue";
ANALYZE "User";
ANALYZE "IssueTimeline";
ANALYZE "IssueMedia";
ANALYZE "IssueComment";
ANALYZE "IssueVote";
ANALYZE "Notification";
ANALYZE "IssueCategory";
ANALYZE "Department";
ANALYZE "RefreshToken";
ANALYZE "AuditLog";