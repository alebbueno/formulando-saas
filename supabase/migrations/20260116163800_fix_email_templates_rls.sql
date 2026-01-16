-- Fix RLS policies for email_templates to allow service role access
-- This is needed for automation engine to fetch templates without user authentication

-- Drop existing restrictive policies if any
DROP POLICY IF EXISTS "Users can view email templates from their workspaces" ON email_templates;
DROP POLICY IF EXISTS "Users can manage email templates" ON email_templates;

-- Create policy that allows service role to read templates (for automations)
CREATE POLICY "Service role can read email templates"
ON email_templates FOR SELECT
USING (true);

-- Create policy for authenticated users to manage their workspace templates
CREATE POLICY "Users can manage workspace email templates"
ON email_templates FOR ALL
USING (
    workspace_id IN (
        SELECT w.id FROM workspaces w
        WHERE w.id = email_templates.workspace_id
    )
)
WITH CHECK (
    workspace_id IN (
        SELECT w.id FROM workspaces w
        WHERE w.id = email_templates.workspace_id
    )
);

-- Ensure RLS is enabled
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
