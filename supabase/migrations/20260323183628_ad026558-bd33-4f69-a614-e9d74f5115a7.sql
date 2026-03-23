
CREATE TABLE public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  name text,
  source text DEFAULT 'landing',
  session_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(email)
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert leads"
  ON public.leads FOR INSERT TO public
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read own leads by email"
  ON public.leads FOR SELECT TO authenticated
  USING (true);
