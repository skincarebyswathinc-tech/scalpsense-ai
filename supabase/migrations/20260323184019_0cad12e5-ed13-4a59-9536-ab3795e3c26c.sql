
CREATE TABLE public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_session_id uuid NOT NULL,
  referral_code text NOT NULL UNIQUE,
  clicks integer NOT NULL DEFAULT 0,
  conversions integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read referrals by code"
  ON public.referrals FOR SELECT TO public
  USING (true);

CREATE POLICY "Anyone can insert referrals"
  ON public.referrals FOR INSERT TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update referral clicks"
  ON public.referrals FOR UPDATE TO public
  USING (true);
