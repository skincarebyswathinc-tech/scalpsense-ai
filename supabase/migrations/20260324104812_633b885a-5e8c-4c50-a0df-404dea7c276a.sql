
-- Products table
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL CHECK (category IN ('shampoo', 'serum', 'oil', 'supplement')),
  tier text NOT NULL CHECK (tier IN ('budget', 'mid-range', 'premium')),
  brand text,
  description text,
  price_display text,
  purchase_url text,
  image_url text,
  target_scalp_types text[] DEFAULT '{}',
  target_symptoms text[] DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Anyone can read active products
CREATE POLICY "Anyone can read active products" ON public.products
  FOR SELECT TO public USING (is_active = true);

-- Product click tracking
CREATE TABLE public.product_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  user_id uuid,
  session_id text,
  click_type text NOT NULL DEFAULT 'view' CHECK (click_type IN ('view', 'purchase_click', 'conversion')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.product_clicks ENABLE ROW LEVEL SECURITY;

-- Anyone can insert clicks
CREATE POLICY "Anyone can insert clicks" ON public.product_clicks
  FOR INSERT TO public WITH CHECK (true);

-- Authenticated users can read own clicks
CREATE POLICY "Authenticated can read own clicks" ON public.product_clicks
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- User roles table for admin
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checks
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- Users can read own roles
CREATE POLICY "Users can read own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Admin policies for products
CREATE POLICY "Admins can insert products" ON public.products
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update products" ON public.products
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete products" ON public.products
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Admins can read all products (including inactive)
CREATE POLICY "Admins can read all products" ON public.products
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Admins can read all clicks
CREATE POLICY "Admins can read all clicks" ON public.product_clicks
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
