-- Fix RLS policies for workspaces to allow service role access
-- This is needed for automation engine to fetch workspace data without user authentication

-- Create policy that allows service role to read workspaces (for automations)
DROP POLICY IF EXISTS "Service role can read workspaces" ON workspaces;

CREATE POLICY "Service role can read workspaces"
ON workspaces FOR SELECT
USING (true);

-- Ensure RLS is enabled
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
