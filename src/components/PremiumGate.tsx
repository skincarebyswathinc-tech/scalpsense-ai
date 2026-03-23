import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useSubscription } from "@/hooks/useSubscription";
import { Button } from "@/components/ui/button";
import { Lock, Sparkles } from "lucide-react";

interface PremiumGateProps {
  children: ReactNode;
  /** What feature is being gated — shown in the CTA */
  feature?: string;
  /** If true, renders children with a blur overlay instead of replacing them */
  blur?: boolean;
}

const PremiumGate = ({ children, feature, blur = true }: PremiumGateProps) => {
  const { isPremium, loading } = useSubscription();

  if (loading) return <>{children}</>;
  if (isPremium) return <>{children}</>;

  if (blur) {
    return (
      <div className="relative">
        <div className="pointer-events-none select-none blur-sm opacity-60">
          {children}
        </div>
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="bg-card/95 backdrop-blur-md border border-border rounded-2xl p-8 max-w-sm text-center shadow-elevated space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-display text-xl font-bold text-foreground">
              Unlock {feature || "This Feature"}
            </h3>
            <p className="font-body text-sm text-muted-foreground">
              Upgrade to Premium to access your full scalp recovery plan.
            </p>
            <p className="font-body text-xs text-destructive font-medium">
              Early intervention prevents long-term hair loss.
            </p>
            <Button variant="hero" size="lg" asChild className="w-full">
              <Link to="/upgrade">
                <Sparkles className="mr-2 h-4 w-4" /> Unlock Your Full Scalp Recovery Plan
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-8 text-center space-y-4">
      <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
        <Lock className="h-6 w-6 text-primary" />
      </div>
      <h3 className="font-display text-xl font-bold text-foreground">
        Unlock {feature || "This Feature"}
      </h3>
      <p className="font-body text-sm text-muted-foreground">
        Upgrade to Premium to access your full scalp recovery plan.
      </p>
      <p className="font-body text-xs text-destructive font-medium">
        Early intervention prevents long-term hair loss.
      </p>
      <Button variant="hero" size="lg" asChild>
        <Link to="/upgrade">
          <Sparkles className="mr-2 h-4 w-4" /> Unlock Your Full Scalp Recovery Plan
        </Link>
      </Button>
    </div>
  );
};

export default PremiumGate;
