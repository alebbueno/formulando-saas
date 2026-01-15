-- Re-assign existing Free workspaces to Growth (so they don't break FK)
-- We set them to 'growth' plan. Access control logic should handle checks on subscription_status.
UPDATE workspaces
SET plan_id = (SELECT id FROM plans WHERE slug = 'growth')
WHERE plan_id = (SELECT id FROM plans WHERE slug = 'free');

-- Remove Free Plan (now safe)
delete from plans where slug = 'free';

-- Update Growth
update plans 
set 
  max_leads_per_month = 5000,
  max_emails_per_month = 2000,
  features = '["Até 5.000 leads", "2.000 emails/mês", "Até 10 landing pages", "Formulários ilimitados", "Funil de vendas completo", "Automações e Webhooks"]'::jsonb
where slug = 'growth';

-- Update Scale
update plans 
set 
  max_leads_per_month = 25000,
  max_emails_per_month = 10000,
  features = '["Até 25.000 leads", "10.000 emails/mês", "Landing pages ilimitadas", "Automações ilimitadas", "IA avançada", "White-label parcial"]'::jsonb
where slug = 'scale';

-- Update Agency Pro
update plans 
set 
  max_leads_per_month = 999999,
  max_emails_per_month = 30000,
  features = '["Leads ilimitados", "30.000 emails/mês", "White-label completo", "Multi-domínio", "IA estendida", "Suporte prioritário"]'::jsonb
where slug = 'agency-pro';
