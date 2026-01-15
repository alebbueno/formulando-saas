-- Create PLANS table
create table if not exists plans (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text not null unique,
  stripe_product_id text,
  stripe_price_id text, -- Added for convenience
  price_monthly integer, -- in cents
  
  -- Limits
  max_workspaces integer default 1,
  max_leads_per_month integer default 1000,
  max_emails_per_month integer default 1000,
  features jsonb default '[]'::jsonb,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table plans enable row level security;

-- Policies for PLANS
-- Public/Authenticated read access
create policy "Anyone can view plans"
  on plans for select
  using ( true );

-- Seed Data (using IDs from Stripe)
insert into plans (name, slug, stripe_product_id, stripe_price_id, price_monthly, max_workspaces, max_leads_per_month, max_emails_per_month, features)
values 
('Growth', 'growth', 'prod_TnUveTAWrd3vMA', 'price_1Sptw3KCwACzC5XnBy67qfWS', 24900, 3, 5000, 2000, '["Até 3 workspaces", "Formulários ilimitados", "Até 10 landing pages", "Até 5.000 leads", "Funil de vendas completo", "Branding removido"]'),
('Scale', 'scale', 'prod_TnUvnNywl8KSo0', 'price_1SptwHKCwACzC5XnQFMJ9901', 54900, 10, 25000, 10000, '["Até 10 workspaces", "Landing pages ilimitadas", "Até 25.000 leads", "Automações ilimitadas", "Domínio próprio", "White-label parcial"]'),
('Agency Pro', 'agency-pro', 'prod_TnUw4hvnE4xKdf', 'price_1SptwUKCwACzC5XnH3ZOzYDR', 89900, 999999, 999999, 30000, '["Workspaces ilimitados", "Leads ilimitados", "White-label completo", "Multi-domínio", "Permissões por usuário", "Suporte prioritário"]'),
('Free', 'free', null, null, 0, 1, 100, 0, '["1 Workspace", "100 leads/mês", "Branding Formulando"]');


-- Update WORKSPACES table with subscription fields
alter table workspaces 
add column if not exists plan_id uuid references plans(id),
add column if not exists subscription_id text,
add column if not exists subscription_status text default 'free', -- 'active', 'past_due', 'canceled', 'free'
add column if not exists stripe_customer_id text,
add column if not exists current_period_end timestamp with time zone;

-- Optional: Link existing workspaces to 'Free' plan by default
do $$
declare
  free_plan_id uuid;
begin
  select id into free_plan_id from plans where slug = 'free' limit 1;
  
  if free_plan_id is not null then
    update workspaces 
    set plan_id = free_plan_id 
    where plan_id is null;
  end if;
end $$;
