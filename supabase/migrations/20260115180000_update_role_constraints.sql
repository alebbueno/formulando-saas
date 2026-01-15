-- Migration: Update role constraints for Invitations and Members

-- 1. Update workspace_invitations
ALTER TABLE public.workspace_invitations 
DROP CONSTRAINT IF EXISTS workspace_invitations_role_check;

ALTER TABLE public.workspace_invitations 
ADD CONSTRAINT workspace_invitations_role_check 
CHECK (role IN ('owner', 'admin', 'member', 'client', 'viewer', 'billing'));

-- 2. Update workspace_members (assuming it has a similar constraint based on the error context, if not it acts as a safeguard)
-- We attempt to drop it if it exists by a common name, or just check the column.
-- Since we don't know the exact constraint name for members, we'll try standard naming or skip causing error.
-- Safest is to just alter the check if known, but if it's an ENUM type, we'd need to ALTER TYPE.
-- Assuming TEXT column with CHECK based on invitation sql.

DO $$
BEGIN
    -- Check if constraint exists specific to workspace_members role
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'workspace_members_role_check') THEN
        ALTER TABLE public.workspace_members DROP CONSTRAINT workspace_members_role_check;
        ALTER TABLE public.workspace_members ADD CONSTRAINT workspace_members_role_check 
        CHECK (role IN ('owner', 'admin', 'member', 'client', 'viewer', 'billing'));
    END IF;
END $$;
