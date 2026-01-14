-- Allow public access to published projects (forms) for embedding
create policy "Public can view published projects"
    on public.projects for select
    using ( is_published = true );
