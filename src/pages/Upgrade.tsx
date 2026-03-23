import { Link } from "react-router-dom";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/landing/Navbar";
import { Check, X, Sparkles, Crown } from "lucide-react";
import { motion } from "framer-motion";

const FREE_FEATURES = [
  { label: "Scalp diagnostic quiz", included: true },
  { label: "Basic report (partial)", included: true },
  { label: "1-week protocol preview", included: true },
  { label: "Full diagnostic report", included: false },
  { label: "6-week recovery protocol", included: false },
  { label: "AI scalp coach", included: false },
  { label: "Progress tracking & charts", included: false },
  { label: "Unlimited photo uploads", included: false },
  { label: "Weekly insights", included: false },
];

const PREMIUM_FEATURES = [
  { label: "Scalp diagnostic quiz", included: true },
  { label: "Full diagnostic report", included: true },
  { label: "6-week recovery protocol", included: true },
  { label: "AI scalp coach", included: true },
  { label: "Habit tracker with streaks", included: true },
  { label: "Scalp recovery score", included: true },
  { label: "Progress tracking & charts", included: true },
  { label: "Unlimited photo uploads", included: true },
  { label: "Photo timeline & comparison", included: true },
  { label: "Weekly insights", included: true },
];

const Upgrade = () => {
  const { isPremium } = useSubscription();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-28 pb-20 container mx-auto px-4 max-w-4xl space-y-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
            Unlock Your Full Scalp Recovery Plan
          </h1>
          <p className="font-body text-lg text-muted-foreground max-w-xl mx-auto">
            Early intervention prevents long-term hair loss. Get the complete toolkit to restore your scalp health.
          </p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Free Plan */}
          <Card className="shadow-card">
            <CardHeader className="text-center pb-4">
              <CardTitle className="font-display text-2xl">Free</CardTitle>
              <p className="text-4xl font-display font-bold text-foreground mt-2">₹0</p>
              <p className="font-body text-sm text-muted-foreground">Forever free</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {FREE_FEATURES.map((f) => (
                <div key={f.label} className="flex items-center gap-2">
                  {f.included ? (
                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                  ) : (
                    <X className="h-4 w-4 text-muted-foreground/40 flex-shrink-0" />
                  )}
                  <span className={`font-body text-sm ${f.included ? "text-foreground" : "text-muted-foreground/50"}`}>
                    {f.label}
                  </span>
                </div>
              ))}
              <Button variant="outline" className="w-full mt-4" disabled>
                Current Plan
              </Button>
            </CardContent>
          </Card>

          {/* Premium Plan */}
          <motion.div initial={{ y: -8 }} animate={{ y: 0 }}>
            <Card className="shadow-elevated border-primary/30 bg-gradient-to-b from-card to-accent/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-body font-semibold px-3 py-1 rounded-bl-lg">
                RECOMMENDED
              </div>
              <CardHeader className="text-center pb-4">
                <CardTitle className="font-display text-2xl flex items-center justify-center gap-2">
                  <Crown className="h-5 w-5 text-primary" /> Premium
                </CardTitle>
                <p className="text-4xl font-display font-bold text-foreground mt-2">
                  ₹499<span className="text-lg text-muted-foreground font-normal">/month</span>
                </p>
                <p className="font-body text-sm text-muted-foreground">Cancel anytime</p>
              </CardHeader>
              <CardContent className="space-y-3">
                {PREMIUM_FEATURES.map((f) => (
                  <div key={f.label} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="font-body text-sm text-foreground">{f.label}</span>
                  </div>
                ))}
                {isPremium ? (
                  <Button variant="outline" className="w-full mt-4" disabled>
                    <Sparkles className="mr-2 h-4 w-4" /> You're on Premium
                  </Button>
                ) : (
                  <Button variant="hero" size="lg" className="w-full mt-4" asChild>
                    <Link to={user ? "/upgrade" : "/auth"}>
                      <Sparkles className="mr-2 h-4 w-4" /> Upgrade Now
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Urgency */}
        <div className="text-center bg-destructive/5 border border-destructive/20 rounded-xl p-6">
          <p className="font-body text-sm text-destructive font-medium">
            ⚠️ Early intervention prevents long-term hair loss. Don't wait — start your recovery today.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Upgrade;
