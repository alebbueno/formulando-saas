-- Allow public access to published landing pages for custom domain routing
create policy "Public can view published landing pages"
    on public.landing_pages for select
    using ( is_published = true );
