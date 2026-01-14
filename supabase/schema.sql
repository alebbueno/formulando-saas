-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- PROFILES
-- Linked to auth.users. specific user details.
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text not null,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Profiles
alter table profiles enable row level security;

create policy "Users can view their own profile" 
  on profiles for select 
  using ( auth.uid() = id );

create policy "Users can update their own profile" 
  on profiles for update 
  using ( auth.uid() = id );

-- Trigger to create profile on signup
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- WORKSPACES
-- Container for projects. Users belong to workspaces.
create table workspaces (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text not null unique,
  owner_id uuid references profiles(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Workspaces
alter table workspaces enable row level security;

-- Members table to handle many-to-many in future, but for now owner is enough for MVP. 
-- However, let's create it to be future proof.
create table workspace_members (
  workspace_id uuid references workspaces(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  role text not null check (role in ('owner', 'member')) default 'member',
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (workspace_id, user_id)
);

alter table workspace_members enable row level security;

-- Policies for Workspace Members
create policy "Users can view their own memberships"
  on workspace_members for select
  using ( user_id = auth.uid() );

-- Policies for Workspaces
-- Owners can always view their workspaces (fixes creation return issue)
create policy "Owners can view their workspaces"
  on workspaces for select
  using ( owner_id = auth.uid() );

-- Users can view workspaces they are members of
create policy "Users can view workspaces they belong to"
  on workspaces for select
  using (
    exists (
      select 1 from workspace_members
      where workspace_members.workspace_id = workspaces.id
      and workspace_members.user_id = auth.uid()
    )
  );

-- Users can create workspaces (and become owner)
create policy "Users can create workspaces"
  on workspaces for insert
  with check ( auth.uid() = owner_id );

-- Helper trigger to add creator as owner member of workspace
create or replace function public.handle_new_workspace()
returns trigger as $$
begin
  insert into public.workspace_members (workspace_id, user_id, role)
  values (new.id, new.owner_id, 'owner');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_workspace_created
  after insert on workspaces
  for each row execute procedure public.handle_new_workspace();


-- PROJECTS (Forms/Pages)
create table projects (
  id uuid default uuid_generate_v4() primary key,
  workspace_id uuid references workspaces(id) on delete cascade not null,
  name text not null,
  description text,
  slug text not null,
  content jsonb default '{}'::jsonb, -- The form/page builder content
  is_published boolean default false,
  settings jsonb default '{}'::jsonb, -- Theme, notifications, etc
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(workspace_id, slug)
);

alter table projects enable row level security;

-- Policies for Projects
create policy "Workspace members can view projects"
  on projects for select
  using (
    exists (
      select 1 from workspace_members
      where workspace_members.workspace_id = projects.workspace_id
      and workspace_members.user_id = auth.uid()
    )
  );

create policy "Workspace members can create projects"
  on projects for insert
  with check (
    exists (
      select 1 from workspace_members
      where workspace_members.workspace_id = projects.workspace_id
      and workspace_members.user_id = auth.uid()
    )
  );

create policy "Workspace members can update projects"
  on projects for update
  using (
    exists (
      select 1 from workspace_members
      where workspace_members.workspace_id = projects.workspace_id
      and workspace_members.user_id = auth.uid()
    )
  );

create policy "Workspace members can delete projects"
  on projects for delete
  using (
    exists (
      select 1 from workspace_members
      where workspace_members.workspace_id = projects.workspace_id
      and workspace_members.user_id = auth.uid()
    )
  );
  
-- Public access to PUBLISHED projects (for viewing the form)
-- Note: This is usually handled by a separate "public" view or specific API, 
-- but we can allow SELECT on specific columns if needed. 
-- For now, let's keep it restricted and assume a service role or edge function will fetch public forms.


-- LEADS (Form Submissions)
create table leads (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references projects(id) on delete cascade not null,
  data jsonb not null, -- The submitted form data
  metadata jsonb default '{}'::jsonb, -- IP, User Agent, etc
  notes text, -- Manual notes field
  ai_analysis jsonb default null, -- AI Analysis (optional)
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table leads enable row level security;

-- Policies for Leads
create policy "Workspace members can view leads"
  on leads for select
  using (
    exists (
      select 1 from workspace_members wm
      join projects p on p.workspace_id = wm.workspace_id
      where p.id = leads.project_id
      and wm.user_id = auth.uid()
    )
  );

-- Public can INSERT leads (Submission)
create policy "Public can create leads"
  on leads for insert
  with check ( true ); -- You might want to restrict this to only existing project_ids via trigger or backend check


-- TEMPLATES
-- Pre-built form templates that users can use to create projects
create table templates (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  category text not null, -- Contato, Eventos, Pesquisa, Feedback, Vendas, Cadastro
  content jsonb not null, -- The form builder content (array of FormElementInstance)
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Templates
alter table templates enable row level security;

-- Templates are public (read-only for all authenticated users)
-- Admin management will be handled separately
create policy "Authenticated users can view active templates"
  on templates for select
  using ( auth.role() = 'authenticated' and is_active = true );

-- AUTOMATIONS (Visual Workflows)
create table automations (
  id uuid default uuid_generate_v4() primary key,
  workspace_id uuid references workspaces(id) on delete cascade not null,
  name text not null,
  description text,
  is_active boolean default false,
  trigger_type text not null, -- 'form_submission'
  trigger_config jsonb default '{}'::jsonb, -- e.g. { form_id: "..." }
  flow_data jsonb default '{}'::jsonb, -- React Flow nodes/edges
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table automations enable row level security;

create policy "Workspace members can view automations"
  on automations for select
  using (
    exists (
      select 1 from workspace_members
      where workspace_members.workspace_id = automations.workspace_id
      and workspace_members.user_id = auth.uid()
    )
  );

create policy "Workspace members can manage automations"
  on automations for all
  using (
    exists (
      select 1 from workspace_members
      where workspace_members.workspace_id = automations.workspace_id
      and workspace_members.user_id = auth.uid()
    )
  );

-- AUTOMATION EXECUTIONS (Logs)
create table automation_executions (
  id uuid default uuid_generate_v4() primary key,
  automation_id uuid references automations(id) on delete cascade not null,
  trigger_event_id uuid, -- e.g. lead_id
  status text not null, -- 'success', 'failure', 'pending'
  logs jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table automation_executions enable row level security;

create policy "Workspace members can view automation executions"
  on automation_executions for select
  using (
    exists (
      select 1 from workspace_members wm
      join automations a on a.workspace_id = wm.workspace_id
      where a.id = automation_executions.automation_id
      and wm.user_id = auth.uid()
    )
  );
