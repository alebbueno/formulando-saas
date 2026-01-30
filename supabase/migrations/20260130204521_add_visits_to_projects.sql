-- Add visits column to projects table for tracking form views
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS visits integer DEFAULT 0;

-- Add comment
COMMENT ON COLUMN projects.visits IS 'Number of times this project/form has been viewed';

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_projects_visits ON projects(visits);
