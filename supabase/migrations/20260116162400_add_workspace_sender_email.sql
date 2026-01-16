-- Add email sender configuration to workspaces
-- This allows each workspace to configure their own sender email and name

ALTER TABLE workspaces 
ADD COLUMN IF NOT EXISTS sender_email TEXT,
ADD COLUMN IF NOT EXISTS sender_name TEXT;

-- Add comment for documentation
COMMENT ON COLUMN workspaces.sender_email IS 'Custom email address to use as sender for automation emails (must be verified in Resend)';
COMMENT ON COLUMN workspaces.sender_name IS 'Custom sender name to display in automation emails';
