
-- Add user_id to referrals for authenticated users
ALTER TABLE public.referrals ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE public.referrals ADD COLUMN IF NOT EXISTS reward_days_earned integer NOT NULL DEFAULT 0;
ALTER TABLE public.referrals ADD COLUMN IF NOT EXISTS reward_applied boolean NOT NULL DEFAULT false;

-- Drop old permissive policies
DROP POLICY IF EXISTS "Anyone can read referrals by code" ON public.referrals;
DROP POLICY IF EXISTS "Anyone can insert referrals" ON public.referrals;
DROP POLICY IF EXISTS "Anyone can update referral clicks" ON public.referrals;

-- New policies: authenticated users manage their own referrals, public can read by code
CREATE POLICY "Users can read own referrals"
  ON public.referrals FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Public can read referral by code"
  ON public.referrals FOR SELECT TO public
  USING (true);

CREATE POLICY "Users can insert own referrals"
  ON public.referrals FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own referrals"
  ON public.referrals FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- Referral conversions table to track individual signups
CREATE TABLE public.referral_conversions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_code text NOT NULL,
  referred_user_id uuid NOT NULL,
  referrer_user_id uuid NOT NULL,
  reward_type text NOT NULL DEFAULT '7_days_premium',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.referral_conversions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own conversions"
  ON public.referral_conversions FOR SELECT TO authenticated
  USING (auth.uid() = referrer_user_id OR auth.uid() = referred_user_id);

CREATE POLICY "Authenticated can insert conversions"
  ON public.referral_conversions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = referred_user_id);
