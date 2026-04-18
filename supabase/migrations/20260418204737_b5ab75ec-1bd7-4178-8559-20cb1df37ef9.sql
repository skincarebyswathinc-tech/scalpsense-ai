-- Create symptom_logs table for users to record daily/weekly scalp symptoms
CREATE TABLE IF NOT EXISTS public.symptom_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  symptoms TEXT[] NOT NULL DEFAULT '{}',
  severity INTEGER NOT NULL DEFAULT 3 CHECK (severity >= 1 AND severity <= 5),
  notes TEXT,
  logged_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.symptom_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own symptom logs"
ON public.symptom_logs
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own symptom logs"
ON public.symptom_logs
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own symptom logs"
ON public.symptom_logs
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_symptom_logs_user_logged
  ON public.symptom_logs (user_id, logged_at DESC);