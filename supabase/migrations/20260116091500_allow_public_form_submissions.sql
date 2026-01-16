-- Enable RLS (if not already enabled)
ALTER TABLE "public"."form_submissions" ENABLE ROW LEVEL SECURITY;

-- Allow public inserts (essential for LP forms)
CREATE POLICY "Allow public submissions" 
ON "public"."form_submissions" 
FOR INSERT 
TO public, anon
WITH CHECK (true);

-- Allow reading only own submissions? Or maybe open read for now if needed?
-- Usually public shouldn't read submissions. 
-- Dashboard users (authenticated) can read via other policies (if they exist, else we might need to add one).
-- But specifically for this error "new row violates...", the INSERT policy is what's missing.
