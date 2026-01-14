-- Create a new storage bucket for landing page assets
insert into storage.buckets (id, name, public)
values ('landing-page-assets', 'landing-page-assets', true);

-- Allow public access to read files
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'landing-page-assets' );

-- Allow authenticated users to upload files
create policy "Authenticated users can upload"
  on storage.objects for insert
  with check (
    bucket_id = 'landing-page-assets'
    and auth.role() = 'authenticated'
  );

-- Allow users to update/delete their own files (optional, but good for management)
create policy "Users can update own files"
  on storage.objects for update
  using (
    bucket_id = 'landing-page-assets'
    and auth.uid() = owner
  );
