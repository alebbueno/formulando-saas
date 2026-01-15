-- Create table for WhatsApp Widget Configuration
CREATE TABLE IF NOT EXISTS public.whatsapp_configs (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
    phone_number text NOT NULL,
    message_template text DEFAULT 'Olá! Gostaria de mais informações.',
    is_active boolean DEFAULT false,
    position text DEFAULT 'bottom-right', -- 'bottom-right', 'bottom-left'
    button_color text DEFAULT '#25D366',
    button_text text DEFAULT 'Falar no WhatsApp',
    button_icon text DEFAULT 'whatsapp', -- 'whatsapp', 'chat', 'support'
    fields_config jsonb DEFAULT '[
        {"name": "name", "label": "Nome", "type": "text", "required": true, "order": 1},
        {"name": "email", "label": "Email", "type": "email", "required": true, "order": 2},
        {"name": "phone", "label": "Telefone", "type": "tel", "required": true, "order": 3}
    ]'::jsonb,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT whatsapp_configs_workspace_id_key UNIQUE (workspace_id)
);

-- Enable RLS
ALTER TABLE public.whatsapp_configs ENABLE ROW LEVEL SECURITY;

-- Policies
-- Workspace members can view their config
CREATE POLICY "Workspace members can view whatsapp config" ON public.whatsapp_configs
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM workspace_members
            WHERE workspace_members.workspace_id = whatsapp_configs.workspace_id
            AND workspace_members.user_id = auth.uid()
        )
    );

-- Workspace members can update their config
CREATE POLICY "Workspace members can update whatsapp config" ON public.whatsapp_configs
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM workspace_members
            WHERE workspace_members.workspace_id = whatsapp_configs.workspace_id
            AND workspace_members.user_id = auth.uid()
        )
    );

-- Workspace members can insert their config
CREATE POLICY "Workspace members can insert whatsapp config" ON public.whatsapp_configs
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM workspace_members
            WHERE workspace_members.workspace_id = whatsapp_configs.workspace_id
            AND workspace_members.user_id = auth.uid()
        )
    );

-- Public access (for the widget to fetch config)
-- We might need a separate policy or use Service Role for fetching public config to avoid exposing everything.
-- For now, let's allow public select if we decide to fetch client-side with anon key?
-- Actually, the widget JS will likely hit an API route. The API route can use Service Role.
-- BUT, if we want to fetch directly from Supabase Client (if we were using it in the script), we'd need a policy.
-- Since we are building a specialized API route per plan (`GET /api/widgets/whatsapp`), we don't need public RLS on the table.
-- The API route will handle the lookup using Service Role (to find by workspace_id provided in query param).
