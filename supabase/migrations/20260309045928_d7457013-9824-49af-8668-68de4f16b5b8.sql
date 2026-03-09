
-- Create scalp_progress_photos if it doesn't exist (may have been lost in partial migration)
CREATE TABLE IF NOT EXISTS public.scalp_progress_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  week_number INTEGER NOT NULL DEFAULT 1,
  photo_type TEXT NOT NULL DEFAULT 'top',
  notes TEXT,
  hair_fall_level TEXT,
  scalp_score INTEGER,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.scalp_progress_photos ENABLE ROW LEVEL SECURITY;

-- Use DO blocks to avoid duplicate policy errors
DO $$ BEGIN
  CREATE POLICY "Users can read own photos" ON public.scalp_progress_photos
    FOR SELECT TO authenticated USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert own photos" ON public.scalp_progress_photos
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
