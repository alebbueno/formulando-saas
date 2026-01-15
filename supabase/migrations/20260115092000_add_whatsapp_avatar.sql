-- Migration to add avatar_url and icon_type to whatsapp_configs
ALTER TABLE public.whatsapp_configs
ADD COLUMN IF NOT EXISTS avatar_url text,
ADD COLUMN IF NOT EXISTS icon_type text DEFAULT 'icon'; -- 'icon' or 'avatar'
