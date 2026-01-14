-- Handle Migration of Old Table
DO $$
BEGIN
    -- Check if 'leads' table exists and has 'project_id' column (signature of old table)
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'leads' 
        AND column_name = 'project_id'
    ) THEN
        -- Rename old leads table to form_submissions
        ALTER TABLE leads RENAME TO form_submissions;
        RAISE NOTICE 'Renamed old leads table to form_submissions';
    END IF;
END $$;

-- Create LEADS table (Entity)
CREATE TABLE IF NOT EXISTS leads (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  name text,
  email text, 
  company text,
  job_title text,
  source_type text, 
  source_id text, 
  score integer DEFAULT 0,
  status text DEFAULT 'Novo Lead',
  tags text[] DEFAULT '{}',
  -- custom_fields will be added via ALTER to support updates
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure custom_fields column exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'custom_fields') THEN
        ALTER TABLE leads ADD COLUMN custom_fields jsonb DEFAULT '{}'::jsonb;
    END IF;
END $$;

-- Enable RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Policies for LEADS
CREATE POLICY "Workspace members can view leads"
  ON leads FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = leads.workspace_id
      AND workspace_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Workspace members can manage leads"
  ON leads FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = leads.workspace_id
      AND workspace_members.user_id = auth.uid()
    )
  );

-- Create LEAD_EVENTS table (Timeline)
CREATE TABLE IF NOT EXISTS lead_events (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  lead_id uuid REFERENCES leads(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL, -- 'form_submit', 'page_view', 'email_opened', 'status_change'
  payload jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE lead_events ENABLE ROW LEVEL SECURITY;

-- Policies for LEAD_EVENTS
CREATE POLICY "Workspace members can view lead events"
  ON lead_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM leads
      JOIN workspace_members ON workspace_members.workspace_id = leads.workspace_id
      WHERE leads.id = lead_events.lead_id
      AND workspace_members.user_id = auth.uid()
    )
  );
