
DROP POLICY "Anyone can read feedback" ON public.feedback;
CREATE POLICY "Authenticated users can read feedback"
ON public.feedback FOR SELECT
TO authenticated
USING (true);
