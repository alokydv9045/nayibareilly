-- Add FCM token fields to users table
-- This migration adds columns for storing Firebase Cloud Messaging tokens

-- Add fcm_token column (stores the device's push notification token)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS fcm_token TEXT;

-- Add fcm_token_updated_at column (tracks when token was last updated)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS fcm_token_updated_at TIMESTAMP;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_fcm_token 
ON users(fcm_token);

-- Add comment
COMMENT ON COLUMN users.fcm_token IS 'Firebase Cloud Messaging token for push notifications';
COMMENT ON COLUMN users.fcm_token_updated_at IS 'Timestamp when FCM token was last updated';

-- Display result
SELECT 'FCM token columns added successfully' AS status;
