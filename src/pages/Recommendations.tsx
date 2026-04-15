import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/landing/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, ShoppingBag, Droplets, FlaskConical, Pill, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

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
  target_symptoms: string[];
}

const categoryIcons: Record<string, typeof Droplets> = {
  shampoo: Droplets,
  serum: FlaskConical,
  oil: Sparkles,
  supplement: Pill,
};

const categoryLabels: Record<string, string> = {
  shampoo: "Shampoos",
  serum: "Serums",
  oil: "Oils",
  supplement: "Supplements",
};

const tierColors: Record<string, string> = {
  budget: "bg-accent text-accent-foreground",
  "mid-range": "bg-primary/15 text-primary",
  premium: "bg-primary text-primary-foreground",
};

const Recommendations = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [userScalpType, setUserScalpType] = useState<string | null>(null);
  const [selectedTier, setSelectedTier] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: prods } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");

      if (prods) setProducts(prods as unknown as Product[]);

      if (user) {
        const { data: reports } = await supabase
          .from("user_reports")
          .select("session_id")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1);

        if (reports && reports.length > 0) {
          const { data: assessment } = await supabase
            .from("scalp_assessments")
            .select("scalp_feel, symptoms")
            .eq("session_id", reports[0].session_id)
            .single();

          if (assessment) {
            setUserScalpType(assessment.scalp_feel);
          }
        }
      }
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const trackClick = async (productId: string, clickType: string) => {
    await supabase.from("product_clicks").insert({
      product_id: productId,
      user_id: user?.id || null,
      session_id: sessionStorage.getItem("session_id") || null,
      click_type: clickType,
    });
  };

  const handlePurchaseClick = (product: Product) => {
    trackClick(product.id, "purchase_click");
    if (product.purchase_url) {
      window.open(product.purchase_url, "_blank", "noopener");
    }
  };

  const sortedProducts = [...products].sort((a, b) => {
    if (!userScalpType) return 0;
    const aMatch = a.target_scalp_types.includes(userScalpType) ? 1 : 0;
    const bMatch = b.target_scalp_types.includes(userScalpType) ? 1 : 0;
    return bMatch - aMatch;
  });

  const filteredProducts = selectedTier === "all"
    ? sortedProducts
    : sortedProducts.filter((p) => p.tier === selectedTier);

  const categories = ["shampoo", "serum", "oil", "supplement"];

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 flex items-center justify-center">
          <p className="text-muted-foreground font-body">Loading recommendations…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 container mx-auto px-4 max-w-5xl space-y-8">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
            Recommended for You
          </h1>
          <p className="text-muted-foreground font-body mt-1">
            {userScalpType
              ? `Personalized picks based on your ${userScalpType.replace("_", " ")} scalp type.`
              : "Products curated for scalp recovery. Take the quiz for personalized recommendations."}
          </p>
        </div>

        {/* Tier Filter */}
        <div className="flex flex-wrap gap-2">
          {[
            { value: "all", label: "All Tiers" },
            { value: "budget", label: "💰 Budget" },
            { value: "mid-range", label: "⚖️ Mid-Range" },
            { value: "premium", label: "✨ Premium" },
          ].map((t) => (
            <Button
              key={t.value}
              variant={selectedTier === t.value ? "hero" : "outline"}
              size="sm"
              onClick={() => setSelectedTier(t.value)}
            >
              {t.label}
            </Button>
          ))}
        </div>

        {/* Product Categories */}
        {categories.map((cat) => {
          const catProducts = filteredProducts.filter((p) => p.category === cat);
          if (catProducts.length === 0) return null;
          const Icon = categoryIcons[cat];

          return (
            <div key={cat} className="space-y-4">
              <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
                <Icon className="h-5 w-5 text-primary" />
                {categoryLabels[cat]}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {catProducts.map((product, i) => {
                  const isMatch = userScalpType && product.target_scalp_types.includes(userScalpType);
                  const imgSrc = product.image_url || DEFAULT_PRODUCT_IMAGE;

                  return (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Card className={`shadow-card h-full flex flex-col ${isMatch ? "border-primary/30 ring-1 ring-primary/10" : ""}`}>
                        {isMatch && (
                          <div className="bg-primary/10 text-primary text-xs font-body font-medium px-3 py-1 text-center">
                            ⭐ Matched to your scalp type
                          </div>
                        )}
                        {/* Product Image */}
                        <div className="w-full aspect-[4/3] bg-muted overflow-hidden">
                          <img
                            src={imgSrc}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_PRODUCT_IMAGE; }}
                          />
                        </div>
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-xs text-muted-foreground font-body">{product.brand}</p>
                              <CardTitle className="font-display text-base">{product.name}</CardTitle>
                            </div>
                            <Badge className={`${tierColors[product.tier]} text-xs shrink-0`}>
                              {product.tier}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col justify-between space-y-3">
                          <p className="text-sm text-muted-foreground font-body">{product.description}</p>
                          <div className="flex items-center justify-between pt-2">
                            <span className="font-display font-bold text-lg text-foreground">{product.price_display}</span>
                            <Button
                              size="sm"
                              variant="hero"
                              onClick={() => handlePurchaseClick(product)}
                            >
                              <ShoppingBag className="mr-1.5 h-3.5 w-3.5" /> Buy
                              <ExternalLink className="ml-1 h-3 w-3" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {filteredProducts.length === 0 && (
          <Card className="shadow-card">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground font-body">No products found for this tier. Try a different filter.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Recommendations;
