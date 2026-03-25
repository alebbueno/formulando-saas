-- Update email_logs status check to support scheduling
ALTER TABLE email_logs DROP CONSTRAINT IF EXISTS email_logs_status_check;

-- Add new statuses: pending and scheduled
ALTER TABLE email_logs ADD CONSTRAINT email_logs_status_check 
    CHECK (status IN ('pending', 'scheduled', 'sent', 'failed', 'bounced', 'delivered'));

-- Add column for scheduled delivery time
ALTER TABLE email_logs ADD COLUMN IF NOT EXISTS scheduled_for TIMESTAMP WITH TIME ZONE;

-- Create index on scheduled_for and status for fast queue processing
CREATE INDEX IF NOT EXISTS idx_email_logs_queue 
    ON email_logs(status, scheduled_for) 
    WHERE status IN ('pending', 'scheduled');
