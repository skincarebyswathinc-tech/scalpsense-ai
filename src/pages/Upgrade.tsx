import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/landing/Navbar";
import UrgencyBanner from "@/components/landing/UrgencyBanner";
import { Check, X, Sparkles, Crown, Shield, ShieldCheck, Star, Users, BarChart3, Clock, CreditCard } from "lucide-react";
import { motion } from "framer-motion";

const RAZORPAY_LINK = "https://rzp.io/rzp/tvRdbY6";

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

const testimonials = [
  { name: "Priya M.", result: "Reduced hair fall by 60% in 4 weeks", avatar: "PM" },
  { name: "Arjun K.", result: "Scalp flaking completely gone in 3 weeks", avatar: "AK" },
  { name: "Sneha R.", result: "Visible regrowth at crown in 6 weeks", avatar: "SR" },
];

const handlePayment = () => {
  window.open(RAZORPAY_LINK, "_blank", "noopener");
};

const Upgrade = () => {
  const { isPremium } = useSubscription();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <UrgencyBanner />
      <Navbar />
      <div className="pt-28 pb-20 container mx-auto px-4 max-w-4xl space-y-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 bg-destructive/10 text-destructive rounded-full px-4 py-1.5 text-sm font-body font-medium"
          >
            <Clock className="h-4 w-4" />
            Limited time: 20% off today only
          </motion.div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
            Unlock Your Full Scalp Recovery Plan
          </h1>
          <p className="font-body text-lg text-muted-foreground max-w-xl mx-auto">
            Early intervention prevents long-term hair loss. Get the complete toolkit to restore your scalp health.
          </p>
        </div>

        {/* Stats bar */}
        <div className="flex justify-center gap-6 md:gap-12">
          {[
            { icon: BarChart3, value: "82%", label: "saw improvement" },
            { icon: Users, value: "50K+", label: "users trust us" },
            { icon: Star, value: "4.8/5", label: "user rating" },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-2 text-center">
              <s.icon className="h-5 w-5 text-primary shrink-0" />
              <div>
                <p className="font-display text-lg font-bold text-foreground">{s.value}</p>
                <p className="text-xs font-body text-muted-foreground">{s.label}</p>
              </div>
            </div>
          ))}
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
                MOST POPULAR
              </div>
              <CardHeader className="text-center pb-4">
                <CardTitle className="font-display text-2xl flex items-center justify-center gap-2">
                  <Crown className="h-5 w-5 text-primary" /> Premium
                </CardTitle>
                <div className="mt-2">
                  <span className="text-lg text-muted-foreground line-through font-body">₹499</span>
                  <p className="text-4xl font-display font-bold text-foreground">
                    ₹399<span className="text-lg text-muted-foreground font-normal">/month</span>
                  </p>
                </div>
                <p className="font-body text-xs text-destructive font-medium">Save ₹100/month — offer ends today!</p>
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
                  <div className="space-y-3 mt-4">
                    <Button variant="hero" size="lg" className="w-full" onClick={handlePayment}>
                      <CreditCard className="mr-2 h-4 w-4" /> Upgrade to Premium — ₹499/mo
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={handlePayment}
                    >
                      <Sparkles className="mr-2 h-4 w-4" /> Claim 20% Off — ₹399/mo →
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Money-Back Guarantee */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-accent/50 border border-primary/20 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left"
        >
          <div className="p-4 bg-primary/10 rounded-full shrink-0">
            <ShieldCheck className="h-8 w-8 text-primary" />
          </div>
          <div>
            <p className="font-display text-lg font-bold text-foreground">30-Day Money-Back Guarantee</p>
            <p className="font-body text-sm text-muted-foreground">
              Not seeing results? Get a full refund within 30 days — no questions asked. We're confident our protocol works because 82% of users see visible improvement in 6 weeks.
            </p>
          </div>
        </motion.div>

        {/* Testimonials */}
        <div className="space-y-4">
          <h2 className="font-display text-xl font-bold text-foreground text-center">Real Results from Real Users</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="shadow-card h-full">
                  <CardContent className="p-4 flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-display font-bold text-primary text-sm shrink-0">
                      {t.avatar}
                    </div>
                    <div>
                      <p className="font-body text-sm font-medium text-foreground">"{t.result}"</p>
                      <p className="text-xs text-muted-foreground font-body mt-1">— {t.name}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap justify-center gap-6 pt-4">
          {[
            { icon: Shield, label: "Clinically Informed" },
            { icon: ShieldCheck, label: "30-Day Guarantee" },
            { icon: Star, label: "4.8★ Rating" },
            { icon: Users, label: "50K+ Users" },
          ].map((badge) => (
            <div key={badge.label} className="flex items-center gap-1.5 text-xs font-body text-muted-foreground">
              <badge.icon className="w-4 h-4 text-primary" />
              <span>{badge.label}</span>
            </div>
          ))}
        </div>

        {/* Urgency CTA */}
        <div className="text-center bg-destructive/5 border border-destructive/20 rounded-xl p-6 space-y-3">
          <p className="font-display text-lg font-bold text-foreground">
            ⚠️ Your scalp won't wait. Start recovery today.
          </p>
          <p className="font-body text-sm text-muted-foreground">
            Every week of delay allows further thinning. 82% of users who started early saw improvement in 6 weeks.
          </p>
          {!isPremium && (
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Button variant="hero" size="lg" onClick={handlePayment}>
                <CreditCard className="mr-2 h-4 w-4" /> Upgrade to Premium
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-destructive/30 text-destructive hover:bg-destructive/10"
                onClick={handlePayment}
              >
                <Sparkles className="mr-2 h-4 w-4" /> Claim 20% Off Now →
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Upgrade;
