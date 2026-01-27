
-- Add new limit columns to PLANS table
ALTER TABLE plans
ADD COLUMN IF NOT EXISTS max_projects integer default 10, -- Max Forms (Projects where type != LP)
ADD COLUMN IF NOT EXISTS max_landing_pages integer default 10, -- Max LPs (Projects where type = LP)
ADD COLUMN IF NOT EXISTS max_automations integer default 5,
ADD COLUMN IF NOT EXISTS max_email_templates integer default 5, -- "email criados"
ADD COLUMN IF NOT EXISTS can_use_whatsapp boolean default true,
ADD COLUMN IF NOT EXISTS can_use_integrations boolean default true,
ADD COLUMN IF NOT EXISTS can_remove_branding boolean default true;

-- Insert or Update FREE Plan limits
INSERT INTO plans (
  name, slug, stripe_product_id, stripe_price_id, price_monthly, 
  max_projects, max_landing_pages, max_leads_per_month, 
  max_emails_per_month, max_email_templates, max_automations, 
  can_use_whatsapp, can_use_integrations, can_remove_branding, 
  features
) VALUES (
  'Free', 'free', 'prod_free', 'price_free', 0,
  2, 1, 100, 100, 2, 1, 
  false, false, false, 
  '["2 Formulários", "1 Landing Page", "100 Leads/mês", "100 Disparos de email/mês", "1 Automação", "WhatsApp Bloqueado"]'::jsonb
) ON CONFLICT (slug) DO UPDATE SET
  max_projects = EXCLUDED.max_projects,
  max_landing_pages = EXCLUDED.max_landing_pages,
  max_leads_per_month = EXCLUDED.max_leads_per_month,
  max_emails_per_month = EXCLUDED.max_emails_per_month,
  max_email_templates = EXCLUDED.max_email_templates,
  max_automations = EXCLUDED.max_automations,
  can_use_whatsapp = EXCLUDED.can_use_whatsapp,
  can_use_integrations = EXCLUDED.can_use_integrations,
  can_remove_branding = EXCLUDED.can_remove_branding,
  features = EXCLUDED.features;

-- Update PAID Plans to be mostly unlimited or high limits
-- GROWTH
UPDATE plans
SET
  max_projects = -1, -- Unlimited forms
  max_landing_pages = 10,
  max_automations = 5,
  max_email_templates = 10,
  can_use_whatsapp = true,
  can_use_integrations = true,
  can_remove_branding = true
WHERE slug = 'growth';

-- SCALE
UPDATE plans
SET
  max_projects = -1,
  max_landing_pages = -1, -- Unlimited LPs
  max_automations = -1, -- Unlimited
  max_email_templates = -1, -- Unlimited
  can_use_whatsapp = true,
  can_use_integrations = true,
  can_remove_branding = true
WHERE slug = 'scale';

-- AGENCY PRO
UPDATE plans
SET
  max_projects = -1,
  max_landing_pages = -1,
  max_automations = -1,
  max_email_templates = -1,
  can_use_whatsapp = true,
  can_use_integrations = true,
  can_remove_branding = true
WHERE slug = 'agency-pro';
