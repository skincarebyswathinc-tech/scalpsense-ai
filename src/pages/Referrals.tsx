import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/landing/Navbar";
import { useToast } from "@/hooks/use-toast";
import {
  Copy, Check, Gift, Users, ArrowLeft, Share2,
  MessageCircle, Twitter, Crown, Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";

function generateCode() {
  return "SS" + Math.random().toString(36).substring(2, 8).toUpperCase();
}

interface Referral {
  id: string;
  referral_code: string;
  clicks: number;
  conversions: number;
  reward_days_earned: number;
  created_at: string;
}

interface Conversion {
  id: string;
  referral_code: string;
  created_at: string;
}

const Referrals = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [referral, setReferral] = useState<Referral | null>(null);
  const [conversions, setConversions] = useState<Conversion[]>([]);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      // Fetch or create referral
      const { data: existing } = await supabase
        .from("referrals" as any)
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (existing) {
        setReferral(existing as any);
      } else {
        const code = generateCode();
        const { data: newRef } = await supabase
          .from("referrals" as any)
          .insert({ user_id: user.id, referrer_session_id: user.id, referral_code: code } as any)
          .select("*")
          .single();
        if (newRef) setReferral(newRef as any);
      }

      // Fetch conversions
      const { data: convs } = await supabase
        .from("referral_conversions" as any)
        .select("id, referral_code, created_at")
        .eq("referrer_user_id", user.id)
        .order("created_at", { ascending: false });

      if (convs) setConversions(convs as any);
      setLoading(false);
    };
    load();
  }, [user]);

  const shareUrl = referral
    ? `${window.location.origin}/quiz?ref=${referral.referral_code}`
    : "";
  const shareText = "I just checked my scalp health score. Try yours here — it's free and takes 60 seconds:";

  const copyLink = async () => {
    await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Link copied!" });
  };

  const shareWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`, "_blank");
  };
  const shareTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, "_blank");
  };

  const totalRewards = referral?.reward_days_earned ?? conversions.length * 7;

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground font-body">Loading…</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 container mx-auto px-4 max-w-3xl space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/dashboard"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">Refer & Earn</h1>
            <p className="text-muted-foreground font-body mt-1">Give your friends healthier hair. Earn rewards.</p>
          </div>
        </div>

        {/* Hero Card */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="shadow-elevated border-primary/20 bg-gradient-to-br from-card to-accent/20 overflow-hidden">
            <CardContent className="p-6 md:p-8 text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Gift className="h-8 w-8 text-primary" />
              </div>
              <h2 className="font-display text-2xl font-bold text-foreground">
                Give your friends healthier hair.<br />
                <span className="text-primary">Earn 7 days of Premium free</span> for each signup.
              </h2>
              <p className="font-body text-sm text-muted-foreground max-w-md mx-auto">
                Share your unique link below. When a friend signs up through your link, you both win — they get expert scalp care, and you earn free Premium access.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Share Link */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <Share2 className="h-5 w-5 text-primary" /> Your Referral Link
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                readOnly
                value={shareUrl}
                className="flex-1 font-body text-sm h-12 bg-muted/50"
              />
              <Button variant="hero" onClick={copyLink} className="h-12 px-4">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span className="ml-2 hidden sm:inline">{copied ? "Copied!" : "Copy"}</span>
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <Button variant="outline" className="h-12 gap-2" onClick={shareWhatsApp}>
                <MessageCircle className="h-5 w-5 text-green-600" /> WhatsApp
              </Button>
              <Button variant="outline" className="h-12 gap-2" onClick={shareTwitter}>
                <Twitter className="h-5 w-5 text-sky-500" /> Twitter
              </Button>
              <Button
                variant="outline" className="h-12 gap-2"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `🧬 I just checked my scalp health — take the free 60-second test:\n${shareUrl}`
                  );
                  toast({ title: "Copied! Paste to Instagram Stories or DMs." });
                }}
              >
                <span className="text-lg">📸</span> Instagram
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="shadow-card">
            <CardContent className="p-5 text-center">
              <Users className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="text-3xl font-display font-bold text-foreground">{conversions.length}</p>
              <p className="text-xs text-muted-foreground font-body">Friends Referred</p>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="p-5 text-center">
              <Crown className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="text-3xl font-display font-bold text-foreground">{totalRewards}</p>
              <p className="text-xs text-muted-foreground font-body">Premium Days Earned</p>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="p-5 text-center">
              <Sparkles className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="text-3xl font-display font-bold text-foreground">{referral?.clicks ?? 0}</p>
              <p className="text-xs text-muted-foreground font-body">Link Clicks</p>
            </CardContent>
          </Card>
        </div>

        {/* How it works */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-display text-lg">How It Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { step: "1", title: "Share your link", desc: "Send your unique referral link to friends via WhatsApp, Twitter, or any channel." },
              { step: "2", title: "Friend signs up", desc: "When they create an account through your link, we track the referral automatically." },
              { step: "3", title: "You earn rewards", desc: "Get 7 days of Premium free for every friend who signs up. No limits!" },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-4"
              >
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 font-display font-bold text-sm">
                  {item.step}
                </div>
                <div>
                  <p className="font-body font-medium text-foreground">{item.title}</p>
                  <p className="font-body text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Referrals */}
        {conversions.length > 0 && (
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="font-display text-lg">Recent Referrals</CardTitle>
              <CardDescription className="font-body">Friends who signed up through your link</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {conversions.map((c, i) => (
                <div key={c.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                      <Users className="h-4 w-4 text-accent-foreground" />
                    </div>
                    <div>
                      <p className="font-body text-sm font-medium text-foreground">Referral #{i + 1}</p>
                      <p className="text-xs text-muted-foreground font-body">
                        {new Date(c.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-body font-medium text-primary bg-accent px-2 py-1 rounded-full">
                    +7 days Premium
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Referrals;
