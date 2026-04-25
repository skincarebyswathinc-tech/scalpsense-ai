ALTER TABLE public.scalp_assessments
  ADD COLUMN IF NOT EXISTS user_id uuid,
  ADD COLUMN IF NOT EXISTS responses jsonb NOT NULL DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_scalp_assessments_user_created
  ON public.scalp_assessments (user_id, created_at DESC);

DROP POLICY IF EXISTS "Users can read own assessments" ON public.scalp_assessments;
CREATE POLICY "Users can read own assessments"
  ON public.scalp_assessments
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can submit own assessments" ON public.scalp_assessments;
CREATE POLICY "Users can submit own assessments"
  ON public.scalp_assessments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own assessments" ON public.scalp_assessments;
CREATE POLICY "Users can update own assessments"
  ON public.scalp_assessments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);