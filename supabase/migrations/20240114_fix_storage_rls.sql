-- Drop existing policies to avoid conflicts or confusion
drop policy if exists "Authenticated users can upload" on storage.objects;
drop policy if exists "Users can update own files" on storage.objects;
drop policy if exists "Public Access" on storage.objects;

-- Ensure the bucket exists and is public
insert into storage.buckets (id, name, public)
values ('landing-page-assets', 'landing-page-assets', true)
on conflict (id) do update set public = true;

-- 1. READ: Allow public access to all files in this bucket (needed for LPs)
create policy "Public Access LP Assets"
  on storage.objects for select
  using ( bucket_id = 'landing-page-assets' );

-- 2. UPLOAD: Allow authenticated users to upload to their own folder (or anywhere in this bucket for now to simplify)
create policy "Authenticated users can upload LP assets"
  on storage.objects for insert
  with check (
    bucket_id = 'landing-page-assets'
    and auth.role() = 'authenticated'
  );

-- 3. UPDATE: Allow users to update their own files
create policy "Users can update own LP assets"
  on storage.objects for update
  using (
    bucket_id = 'landing-page-assets'
    and owner = auth.uid()
  );

-- 4. DELETE: Allow users to delete their own files
create policy "Users can delete own LP assets"
  on storage.objects for delete
  using (
    bucket_id = 'landing-page-assets'
    and owner = auth.uid()
  );
