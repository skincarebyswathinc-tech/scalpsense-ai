import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, ArrowRight } from "lucide-react";

interface Kit {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  price_display: string | null;
  target_symptoms: string[];
}

const RecoveryKits = () => {
  const { user } = useAuth();
  const [kits, setKits] = useState<Kit[]>([]);

  useEffect(() => {
    const fetchKits = async () => {
      // Optionally personalize by scalp type in the future
      const { data } = await supabase
        .from("product_kits")
        .select("id, name, slug, tagline, price_display, target_symptoms")
        .eq("is_active", true)
        .order("sort_order")
        .limit(3);
      if (data) setKits(data as unknown as Kit[]);
    };
    fetchKits();
  }, [user]);

  if (kits.length === 0) return null;

  return (
    <Card className="shadow-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-display text-lg flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" /> Recovery Kits
        </CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/kits">View All <ArrowRight className="ml-1 h-3 w-3" /></Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {kits.map((kit) => (
            <Link
              key={kit.id}
              to={`/kits/${kit.slug}`}
              className="p-3 rounded-lg border border-border bg-card hover:border-primary/30 transition-colors space-y-2 block"
            >
              <Badge className="bg-primary/10 text-primary text-[10px]">
                {kit.target_symptoms[0]?.replace("_", " ") || "Kit"}
              </Badge>
              <p className="font-body text-sm font-medium text-foreground">{kit.name}</p>
              <p className="text-xs text-muted-foreground font-body line-clamp-2">{kit.tagline}</p>
              <p className="font-display font-bold text-foreground">{kit.price_display}</p>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecoveryKits;
