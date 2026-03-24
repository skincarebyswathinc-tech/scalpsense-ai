
-- Product kits / bundles
CREATE TABLE public.product_kits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  tagline text,
  description text,
  price_display text,
  price_amount integer, -- in paise/cents for future payment integration
  image_url text,
  usage_guide text, -- markdown
  routine_plan text, -- markdown
  target_scalp_types text[] DEFAULT '{}',
  target_symptoms text[] DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.product_kits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active kits" ON public.product_kits
  FOR SELECT TO public USING (is_active = true);

CREATE POLICY "Admins can read all kits" ON public.product_kits
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert kits" ON public.product_kits
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update kits" ON public.product_kits
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete kits" ON public.product_kits
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Junction table: kit <-> products
CREATE TABLE public.kit_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kit_id uuid REFERENCES public.product_kits(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  UNIQUE (kit_id, product_id)
);

ALTER TABLE public.kit_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read kit products" ON public.kit_products
  FOR SELECT TO public USING (true);

CREATE POLICY "Admins can manage kit products" ON public.kit_products
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
