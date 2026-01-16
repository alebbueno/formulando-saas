-- Fix RLS policies for form_submissions to allow public inserts
-- This ensures landing page forms can submit data

-- First, drop any conflicting policies
DROP POLICY IF EXISTS "Allow public submissions" ON "public"."form_submissions";
DROP POLICY IF EXISTS "Public can create leads" ON "public"."form_submissions";
DROP POLICY IF EXISTS "Public can insert submissions" ON "public"."form_submissions";

-- Create a clear policy for public inserts
CREATE POLICY "Enable public form submissions"
ON "public"."form_submissions"
FOR INSERT
TO public, anon, authenticated
WITH CHECK (true);

-- Ensure RLS is enabled
ALTER TABLE "public"."form_submissions" ENABLE ROW LEVEL SECURITY;
