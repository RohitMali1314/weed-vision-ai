-- Drop the restrictive SELECT policy
DROP POLICY IF EXISTS "No public read access" ON public.feedback;

-- Allow anyone to read feedback (for admin page)
CREATE POLICY "Anyone can read feedback"
ON public.feedback
FOR SELECT
USING (true);