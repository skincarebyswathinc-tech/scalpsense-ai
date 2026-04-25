DROP POLICY IF EXISTS "Anyone can submit assessments" ON public.scalp_assessments;
CREATE POLICY "Anyone can submit session assessments"
  ON public.scalp_assessments
  FOR INSERT
  TO public
  WITH CHECK (user_id IS NULL AND session_id IS NOT NULL);