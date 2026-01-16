-- Add email usage tracking to workspaces
-- This tracks how many emails have been sent this month for plan limit enforcement

ALTER TABLE workspaces 
ADD COLUMN IF NOT EXISTS emails_sent_this_month INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS email_usage_reset_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add comment for documentation
COMMENT ON COLUMN workspaces.emails_sent_this_month IS 'Number of automation emails sent in the current billing period';
COMMENT ON COLUMN workspaces.email_usage_reset_at IS 'Timestamp when the email counter was last reset (monthly)';

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_workspaces_email_usage ON workspaces(emails_sent_this_month, email_usage_reset_at);
