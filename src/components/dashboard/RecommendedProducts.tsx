import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, ExternalLink, ArrowRight } from "lucide-react";

const DEFAULT_PRODUCT_IMAGE = "/placeholder.svg";

interface Product {
  id: string;
  name: string;
  category: string;
  tier: string;
  brand: string | null;
  description: string | null;
  price_display: string | null;
  purchase_url: string | null;
  image_url: string | null;
  target_scalp_types: string[];
}

const tierColors: Record<string, string> = {
  budget: "bg-accent text-accent-foreground",
  "mid-range": "bg-primary/15 text-primary",
  premium: "bg-primary text-primary-foreground",
};

const RecommendedProducts = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetch = async () => {
      let scalpType: string | null = null;
      if (user) {
        const { data: reports } = await supabase
          .from("user_reports")
          .select("session_id")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1);

        if (reports?.[0]) {
          const { data: assessment } = await supabase
            .from("scalp_assessments")
            .select("scalp_feel")
            .eq("session_id", reports[0].session_id)
            .single();
          if (assessment) scalpType = assessment.scalp_feel;
        }
      }

      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .order("sort_order")
        .limit(6);

      if (data) {
        let prods = data as unknown as Product[];
        if (scalpType) {
          prods = [...prods].sort((a, b) => {
            const aM = a.target_scalp_types.includes(scalpType!) ? 1 : 0;
            const bM = b.target_scalp_types.includes(scalpType!) ? 1 : 0;
            return bM - aM;
          });
        }
        setProducts(prods.slice(0, 3));
      }
    };
    fetch();
  }, [user]);

  const trackClick = async (productId: string) => {
    await supabase.from("product_clicks").insert({
      product_id: productId,
      user_id: user?.id || null,
      click_type: "purchase_click",
    });
  };

  if (products.length === 0) return null;

  return (
    <Card className="shadow-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-display text-lg flex items-center gap-2">
          <ShoppingBag className="h-5 w-5 text-primary" /> Recommended for You
        </CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/recommendations">View All <ArrowRight className="ml-1 h-3 w-3" /></Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {products.map((p) => {
            const imgSrc = p.image_url || DEFAULT_PRODUCT_IMAGE;
            return (
              <div key={p.id} className="p-3 rounded-lg border border-border bg-card space-y-2">
                <div className="w-full aspect-[3/2] rounded-md overflow-hidden bg-muted mb-2">
                  <img
                    src={imgSrc}
                    alt={p.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_PRODUCT_IMAGE; }}
                  />
                </div>
                <div className="flex items-start justify-between gap-1">
                  <div>
                    <p className="text-xs text-muted-foreground font-body">{p.brand}</p>
                    <p className="font-body text-sm font-medium text-foreground">{p.name}</p>
                  </div>
                  <Badge className={`${tierColors[p.tier]} text-[10px] shrink-0`}>{p.tier}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-display font-bold text-foreground">{p.price_display}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs"
                    onClick={() => {
                      trackClick(p.id);
                      if (p.purchase_url) window.open(p.purchase_url, "_blank", "noopener");
                    }}
                  >
                    Buy <ExternalLink className="ml-1 h-3 w-3" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecommendedProducts;
