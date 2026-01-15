-- Migration: Add legacy lead fields to leads table
-- Corrected based on actual schema: leads does NOT have project_id, but uses custom_fields, source_type, etc.

DO $$
BEGIN
    -- 1. Add phone if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'phone') THEN
        ALTER TABLE leads ADD COLUMN phone TEXT;
    END IF;

    -- 2. Add page_url if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'page_url') THEN
        ALTER TABLE leads ADD COLUMN page_url TEXT;
    END IF;

    -- 3. Add ip_address and user_agent if valid to store directly, otherwise they go to metadata/custom_fields.
    -- The user schema has 'source_type', let's use that instead of 'source' column.
    
    -- 4. Ensure workspace_id foreign key logic is correct (already exists in schema provided).

END $$;
