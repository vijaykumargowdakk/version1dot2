-- Add policy for public read access to demo scans (where user_id IS NULL)
CREATE POLICY "Public read access for demo scans"
ON public.inspections
FOR SELECT
TO anon, authenticated
USING (user_id IS NULL);
