-- Add isFlagged field to issues table
-- This field is used by moderators to flag problematic content

ALTER TABLE "issues" 
ADD COLUMN IF NOT EXISTS "isFlagged" BOOLEAN NOT NULL DEFAULT false;

-- Add index for performance when querying flagged issues
CREATE INDEX IF NOT EXISTS "issues_isFlagged_idx" ON "issues"("isFlagged");

-- Add isFlagged field to users table
-- This field is used to flag users who repeatedly submit spam

ALTER TABLE "users" 
ADD COLUMN IF NOT EXISTS "isFlagged" BOOLEAN NOT NULL DEFAULT false;

-- Add index for performance when querying flagged users
CREATE INDEX IF NOT EXISTS "users_isFlagged_idx" ON "users"("isFlagged");

-- Update any existing spam issues to be flagged
UPDATE "issues" 
SET "isFlagged" = true 
WHERE "isSpam" = true OR "moderationStatus" = 'SPAM_FLAGGED';

-- Commit the changes
COMMIT;
