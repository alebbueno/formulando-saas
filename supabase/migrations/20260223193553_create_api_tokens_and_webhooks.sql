create table api_tokens (
  id uuid default uuid_generate_v4() primary key,
  workspace_id uuid references workspaces(id) on delete cascade not null,
  name text not null,
  token text not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  last_used_at timestamp with time zone
);

alter table api_tokens enable row level security;

create policy "Workspace members can view API tokens"
  on api_tokens for select
  using (
    exists (
      select 1 from workspace_members
      where workspace_members.workspace_id = api_tokens.workspace_id
      and workspace_members.user_id = auth.uid()
    )
  );

create policy "Workspace members can manage API tokens"
  on api_tokens for all
  using (
    exists (
      select 1 from workspace_members
      where workspace_members.workspace_id = api_tokens.workspace_id
      and workspace_members.user_id = auth.uid()
    )
  );

create table webhooks (
  id uuid default uuid_generate_v4() primary key,
  workspace_id uuid references workspaces(id) on delete cascade not null,
  name text not null,
  url text not null,
  secret text,
  events text[] default '{"lead.created"}',
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table webhooks enable row level security;

create policy "Workspace members can view webhooks"
  on webhooks for select
  using (
    exists (
      select 1 from workspace_members
      where workspace_members.workspace_id = webhooks.workspace_id
      and workspace_members.user_id = auth.uid()
    )
  );

create policy "Workspace members can manage webhooks"
  on webhooks for all
  using (
    exists (
      select 1 from workspace_members
      where workspace_members.workspace_id = webhooks.workspace_id
      and workspace_members.user_id = auth.uid()
    )
  );
