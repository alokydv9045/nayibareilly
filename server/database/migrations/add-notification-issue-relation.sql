-- Add relatedIssueId to notifications table
-- This allows notifications to reference specific issues

-- Add column
ALTER TABLE "notifications" ADD COLUMN IF NOT EXISTS "relatedIssueId" TEXT;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS "notifications_relatedIssueId_idx" ON "notifications"("relatedIssueId");

-- Add foreign key constraint
ALTER TABLE "notifications" 
ADD CONSTRAINT "notifications_relatedIssueId_fkey" 
FOREIGN KEY ("relatedIssueId") 
REFERENCES "issues"("id") 
ON DELETE SET NULL 
ON UPDATE CASCADE;
