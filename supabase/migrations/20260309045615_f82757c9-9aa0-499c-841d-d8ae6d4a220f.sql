
-- Weekly scalp recovery scores
CREATE TABLE public.scalp_recovery_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  habit_score INTEGER NOT NULL DEFAULT 0,
  hairfall_score INTEGER NOT NULL DEFAULT 0,
  symptom_score INTEGER NOT NULL DEFAULT 0,
  protocol_score INTEGER NOT NULL DEFAULT 0,
  photo_score INTEGER NOT NULL DEFAULT 0,
  message TEXT,
  calculated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, week_number)
);

ALTER TABLE public.scalp_recovery_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own scores" ON public.scalp_recovery_scores
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scores" ON public.scalp_recovery_scores
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scores" ON public.scalp_recovery_scores
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
