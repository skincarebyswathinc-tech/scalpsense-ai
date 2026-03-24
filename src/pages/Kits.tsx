import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/landing/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Package, ShoppingBag, ExternalLink, BookOpen, Calendar } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";

interface Kit {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  price_display: string | null;
  usage_guide: string | null;
  routine_plan: string | null;
  target_scalp_types: string[];
  target_symptoms: string[];
}

interface KitProduct {
  id: string;
  sort_order: number;
  product: {
    id: string;
    name: string;
    brand: string | null;
    category: string;
    tier: string;
    price_display: string | null;
    purchase_url: string | null;
    description: string | null;
  };
}

const tierColors: Record<string, string> = {
  budget: "bg-accent text-accent-foreground",
  "mid-range": "bg-primary/15 text-primary",
  premium: "bg-primary text-primary-foreground",
};

const KitsPage = () => {
  const { slug } = useParams();
  const { user } = useAuth();
  const [kits, setKits] = useState<Kit[]>([]);
  const [selectedKit, setSelectedKit] = useState<Kit | null>(null);
  const [kitProducts, setKitProducts] = useState<KitProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchKits = async () => {
      const { data } = await supabase
        .from("product_kits")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      if (data) setKits(data as unknown as Kit[]);
      setLoading(false);
    };
    fetchKits();
  }, []);

  useEffect(() => {
    if (slug && kits.length > 0) {
      const kit = kits.find((k) => k.slug === slug);
      if (kit) {
        setSelectedKit(kit);
        fetchKitProducts(kit.id);
      }
    } else {
      setSelectedKit(null);
    }
  }, [slug, kits]);

  const fetchKitProducts = async (kitId: string) => {
    // Fetch kit_products joined with products
    const { data } = await supabase
      .from("kit_products")
      .select("id, sort_order, product_id")
      .eq("kit_id", kitId)
      .order("sort_order");

    if (data && data.length > 0) {
      const productIds = data.map((kp: any) => kp.product_id);
      const { data: products } = await supabase
        .from("products")
        .select("id, name, brand, category, tier, price_display, purchase_url, description")
        .in("id", productIds);

      if (products) {
        const mapped = data.map((kp: any) => ({
          id: kp.id,
          sort_order: kp.sort_order,
          product: products.find((p: any) => p.id === kp.product_id)!,
        })).filter((kp: any) => kp.product);
        setKitProducts(mapped as KitProduct[]);
      }
    }
  };

  const trackClick = async (productId: string) => {
    await supabase.from("product_clicks").insert({
      product_id: productId,
      user_id: user?.id || null,
      click_type: "purchase_click",
    });
  };

  const renderMarkdown = (text: string) => {
    // Simple markdown renderer for headers and bold
    return text.split("\n").map((line, i) => {
      if (line.startsWith("## ")) return <h3 key={i} className="font-display text-lg font-bold text-foreground mt-4 mb-2">{line.replace("## ", "")}</h3>;
      if (line.startsWith("**") && line.endsWith("**")) return <p key={i} className="font-body text-sm font-semibold text-foreground mt-2">{line.replace(/\*\*/g, "")}</p>;
      if (line.match(/^\d+\./)) return <p key={i} className="font-body text-sm text-muted-foreground ml-4">{line.replace(/\*\*(.*?)\*\*/g, "$1")}</p>;
      if (line.startsWith("- ")) return <p key={i} className="font-body text-sm text-muted-foreground ml-4">• {line.replace("- ", "")}</p>;
      if (line.trim() === "") return <br key={i} />;
      return <p key={i} className="font-body text-sm text-muted-foreground">{line.replace(/\*\*(.*?)\*\*/g, "$1")}</p>;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 flex items-center justify-center">
          <p className="text-muted-foreground font-body">Loading kits…</p>
        </div>
      </div>
    );
  }

  // Detail view
  if (selectedKit) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-16 container mx-auto px-4 max-w-4xl space-y-8">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/kits"><ArrowLeft className="mr-2 h-4 w-4" /> All Kits</Link>
          </Button>

          {/* Hero */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="shadow-elevated border-primary/20 bg-gradient-to-br from-card to-accent/20">
              <CardContent className="p-6 md:p-8">
                <Badge className="bg-primary text-primary-foreground mb-3">Recovery Kit</Badge>
                <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">{selectedKit.name}</h1>
                <p className="text-muted-foreground font-body mt-2 text-lg">{selectedKit.tagline}</p>
                <p className="text-foreground font-body mt-4">{selectedKit.description}</p>
                <div className="flex items-center gap-4 mt-6">
                  <span className="font-display text-3xl font-bold text-foreground">{selectedKit.price_display}</span>
                  <Badge variant="outline" className="text-xs">One-time purchase</Badge>
                </div>
                <Button variant="hero" size="lg" className="mt-6">
                  <ShoppingBag className="mr-2 h-5 w-5" /> Buy This Kit
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* What's Included */}
          <div className="space-y-4">
            <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" /> What's Included
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {kitProducts.map((kp, i) => (
                <motion.div key={kp.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                  <Card className="shadow-card h-full flex flex-col">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-xs text-muted-foreground font-body">{kp.product.brand}</p>
                          <CardTitle className="font-display text-base">{kp.product.name}</CardTitle>
                        </div>
                        <Badge className={`${tierColors[kp.product.tier]} text-xs shrink-0`}>{kp.product.tier}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col justify-between space-y-3">
                      <p className="text-sm text-muted-foreground font-body">{kp.product.description}</p>
                      <div className="flex items-center justify-between pt-2">
                        <span className="font-display font-bold text-foreground">{kp.product.price_display}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs"
                          onClick={() => {
                            trackClick(kp.product.id);
                            if (kp.product.purchase_url) window.open(kp.product.purchase_url, "_blank", "noopener");
                          }}
                        >
                          Buy Solo <ExternalLink className="ml-1 h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Usage Guide & Routine Plan */}
          <Tabs defaultValue="usage" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="usage" className="flex-1 gap-2"><BookOpen className="h-4 w-4" /> Usage Guide</TabsTrigger>
              <TabsTrigger value="routine" className="flex-1 gap-2"><Calendar className="h-4 w-4" /> Routine Plan</TabsTrigger>
            </TabsList>
            <TabsContent value="usage">
              <Card className="shadow-card">
                <CardContent className="p-6">
                  {selectedKit.usage_guide ? renderMarkdown(selectedKit.usage_guide) : <p className="text-muted-foreground font-body text-sm">Usage guide coming soon.</p>}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="routine">
              <Card className="shadow-card">
                <CardContent className="p-6">
                  {selectedKit.routine_plan ? renderMarkdown(selectedKit.routine_plan) : <p className="text-muted-foreground font-body text-sm">Routine plan coming soon.</p>}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  }

  // List view
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 container mx-auto px-4 max-w-5xl space-y-8">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">Recovery Kits</h1>
          <p className="text-muted-foreground font-body mt-1">Curated product bundles with usage guides and routine plans for targeted scalp recovery.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {kits.map((kit, i) => (
            <motion.div key={kit.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="shadow-card h-full flex flex-col hover:shadow-elevated transition-shadow">
                <CardHeader>
                  <Badge className="bg-primary/10 text-primary w-fit mb-2">{kit.target_symptoms[0]?.replace("_", " ") || "Recovery"}</Badge>
                  <CardTitle className="font-display text-xl">{kit.name}</CardTitle>
                  <p className="text-sm text-muted-foreground font-body">{kit.tagline}</p>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-end space-y-4">
                  <p className="text-sm text-muted-foreground font-body">{kit.description?.slice(0, 120)}…</p>
                  <div className="flex items-center justify-between pt-2">
                    <span className="font-display text-2xl font-bold text-foreground">{kit.price_display}</span>
                    <Button variant="hero" size="sm" asChild>
                      <Link to={`/kits/${kit.slug}`}>View Kit</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {kits.length === 0 && (
          <Card className="shadow-card">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground font-body">No kits available yet. Check back soon!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default KitsPage;
