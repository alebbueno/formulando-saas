-- Create invitations table
CREATE TABLE IF NOT EXISTS public.workspace_invitations (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    email text NOT NULL,
    role text NOT NULL CHECK (role IN ('member', 'client', 'admin')),
    workspace_ids uuid[] NOT NULL,
    inviter_id uuid REFERENCES auth.users(id),
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted')),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.workspace_invitations ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view invitations they created"
    ON public.workspace_invitations FOR SELECT
    USING (auth.uid() = inviter_id);

CREATE POLICY "Users can create invitations"
    ON public.workspace_invitations FOR INSERT
    WITH CHECK (auth.uid() = inviter_id);

-- Function to handle new user registration matching invitations
CREATE OR REPLACE FUNCTION public.handle_new_user_invitation()
RETURNS trigger AS $$
DECLARE
    invite record;
    ws_id uuid;
BEGIN
    FOR invite IN 
        SELECT * FROM public.workspace_invitations 
        WHERE email = new.email AND status = 'pending'
    LOOP
        -- Insert into workspace_members for each workspace in the array
        FOREACH ws_id IN ARRAY invite.workspace_ids
        LOOP
            INSERT INTO public.workspace_members (workspace_id, user_id, role)
            VALUES (ws_id, new.id, invite.role::text) -- Cast to text/enum if needed. Assuming role column in workspace_members matches.
            ON CONFLICT (workspace_id, user_id) DO NOTHING;
        END LOOP;

        -- Update invitation status
        UPDATE public.workspace_invitations 
        SET status = 'accepted', updated_at = now()
        WHERE id = invite.id;
    END LOOP;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on profiles creation
-- We assume public.profiles is created roughly when the user signs up.
-- If it's not guaranteed, this might misfire, but usually safe in standard Supabase starters.
DROP TRIGGER IF EXISTS on_profile_created_check_invites ON public.profiles;

CREATE TRIGGER on_profile_created_check_invites
    AFTER INSERT ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_invitation();
