-- Rename table
ALTER TABLE leads RENAME TO form_submissions;

-- Rename generic RLS policies if necessary to avoid confusion (Optional but good practice)
-- Note: Policies usually stick to the table OID, so renaming table updates policy reference, 
-- but we might want to rename the policy text itself for clarity.

-- Drop old policies to be clean (re-create for form_submissions)
DROP POLICY IF EXISTS "Workspace members can view leads" ON form_submissions;
DROP POLICY IF EXISTS "Public can create leads" ON form_submissions;

-- Re-create policies for form_submissions
CREATE POLICY "Workspace members can view submissions"
  ON form_submissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members wm
      JOIN projects p ON p.workspace_id = wm.workspace_id
      WHERE p.id = form_submissions.project_id
      AND wm.user_id = auth.uid()
    )
  );

CREATE POLICY "Public can create submissions"
  ON form_submissions FOR INSERT
  WITH CHECK ( true );
