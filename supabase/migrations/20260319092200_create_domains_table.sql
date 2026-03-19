-- Migration: Create domains table for Resend integration
-- Date: 2026-03-19

-- Drop existing if created from the original plan with different schema
DROP TABLE IF EXISTS public.domains CASCADE;

CREATE TABLE public.domains (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    workspace_id uuid REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
    domain text NOT NULL,
    status text DEFAULT 'pending'::text, -- pending, verified, failed
    resend_domain_id text,
    dns_records jsonb,
    is_default boolean DEFAULT false,
    verified_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.domains ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Allow owners of the workspace to manage domains
CREATE POLICY "Workspace owners can manage domains" 
ON public.domains 
FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.workspaces 
        WHERE public.workspaces.id = domains.workspace_id 
        AND (public.workspaces.owner_id = auth.uid())
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.workspaces 
        WHERE public.workspaces.id = domains.workspace_id 
        AND (public.workspaces.owner_id = auth.uid())
    )
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_domains_workspace_id ON public.domains(workspace_id);
CREATE INDEX IF NOT EXISTS idx_domains_domain ON public.domains(domain);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_domains_updated_at ON public.domains;
CREATE TRIGGER tr_domains_updated_at
    BEFORE UPDATE ON public.domains
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
