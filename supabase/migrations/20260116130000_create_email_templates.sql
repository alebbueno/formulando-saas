-- Create email templates table for transactional email management
CREATE TABLE IF NOT EXISTS email_templates (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  subject text NOT NULL,
  body_html text NOT NULL,
  body_text text,
  category text DEFAULT 'general',
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_templates_workspace ON email_templates(workspace_id);
CREATE INDEX IF NOT EXISTS idx_email_templates_active ON email_templates(workspace_id, is_active);
CREATE INDEX IF NOT EXISTS idx_email_templates_category ON email_templates(category);

-- Enable RLS
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Workspace members can view email templates"
  ON email_templates FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = email_templates.workspace_id
      AND workspace_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Workspace members can create email templates"
  ON email_templates FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = email_templates.workspace_id
      AND workspace_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Workspace members can update email templates"
  ON email_templates FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = email_templates.workspace_id
      AND workspace_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Workspace members can delete email templates"
  ON email_templates FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = email_templates.workspace_id
      AND workspace_members.user_id = auth.uid()
    )
  );

-- Add some helpful comments
COMMENT ON TABLE email_templates IS 'Email templates for transactional emails with merge tag support';
COMMENT ON COLUMN email_templates.subject IS 'Email subject line with merge tags like {{lead.name}}';
COMMENT ON COLUMN email_templates.body_html IS 'HTML email body with merge tags';
COMMENT ON COLUMN email_templates.body_text IS 'Plain text fallback';
COMMENT ON COLUMN email_templates.category IS 'Template category for organization (welcome, follow-up, etc)';
