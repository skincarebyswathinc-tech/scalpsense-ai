import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/landing/Navbar";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, ArrowRight, Lock, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

const Report = () => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [captured, setCaptured] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const sid = localStorage.getItem("scalp_session_id");
    setSessionId(sid);
    const leadCaptured = localStorage.getItem("lead_captured");
    if (leadCaptured === "true") setCaptured(true);
  }, []);

  const handleEmailCapture = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);

    const { error } = await supabase.from("leads" as any).upsert(
      { email: email.trim(), source: "quiz_report", session_id: sessionId } as any,
      { onConflict: "email" }
    );

    setLoading(false);

    if (error) {
      toast({ title: "Something went wrong", description: error.message, variant: "destructive" });
      return;
    }

    localStorage.setItem("lead_captured", "true");
    setCaptured(true);
    toast({ title: "Report unlocked! 🎉" });
  };

  // Preview items (visible to all)
  const previewInsights = [
    "Your scalp shows signs that need attention",
    "Based on your quiz, we identified key risk factors",
    "A personalized recovery protocol has been generated",
  ];

  // Locked items (require email)
  const lockedInsights = [
    "Detailed symptom analysis & severity mapping",
    "Root cause identification",
    "Personalized 6-week recovery protocol",
    "Product & ingredient recommendations",
    "Lifestyle modifications for your profile",
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-28 pb-20 container mx-auto px-4 max-w-2xl space-y-8">
        <div className="text-center space-y-3">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
            Your Scalp Health Report
          </h1>
          {sessionId ? (
            <p className="text-muted-foreground font-body text-lg">
              Your assessment is complete. {captured ? "Here are your results." : "Enter your email to unlock your full report."}
            </p>
          ) : (
            <p className="text-muted-foreground font-body text-lg">
              Take the 60-second scalp quiz first to generate your report.
            </p>
          )}
        </div>

        {!sessionId ? (
          <div className="text-center">
            <Button variant="hero" size="xl" asChild>
              <Link to="/quiz">Start Free Scalp Test <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        ) : (
          <>
            {/* Free preview section */}
            <Card className="shadow-card">
              <CardContent className="p-6 space-y-4">
                <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" /> Report Preview
                </h2>
                {previewInsights.map((insight, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.15 }}
                    className="flex items-start gap-3"
                  >
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <p className="font-body text-sm text-foreground">{insight}</p>
                  </motion.div>
                ))}
              </CardContent>
            </Card>

            {/* Locked section or full report */}
            {!captured ? (
              <div className="relative">
                {/* Blurred locked content */}
                <div className="pointer-events-none select-none blur-sm opacity-50">
                  <Card className="shadow-card">
                    <CardContent className="p-6 space-y-4">
                      <h2 className="font-display text-xl font-bold text-foreground">Full Report</h2>
                      {lockedInsights.map((insight, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          <p className="font-body text-sm text-foreground">{insight}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                {/* Email capture overlay */}
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <Card className="shadow-elevated border-primary/20 max-w-sm w-full">
                    <CardContent className="p-6 text-center space-y-4">
                      <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Lock className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="font-display text-xl font-bold text-foreground">
                        Unlock Your Full Report
                      </h3>
                      <p className="font-body text-sm text-muted-foreground">
                        Enter your email to see your complete scalp analysis and personalized recovery plan.
                      </p>
                      <p className="font-body text-xs text-destructive font-medium">
                        Early intervention prevents long-term hair loss.
                      </p>
                      <form onSubmit={handleEmailCapture} className="space-y-3">
                        <Input
                          type="email"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="h-12 rounded-xl font-body"
                          required
                        />
                        <Button variant="hero" size="lg" className="w-full" type="submit" disabled={loading}>
                          {loading ? "Unlocking…" : "Unlock My Report →"}
                        </Button>
                      </form>
                      <p className="text-xs text-muted-foreground font-body">
                        🔒 We'll never spam you. Unsubscribe anytime.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <Card className="shadow-card border-primary/20">
                <CardContent className="p-6 space-y-4">
                  <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" /> Full Report
                  </h2>
                  {lockedInsights.map((insight, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-start gap-3"
                    >
                      <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <p className="font-body text-sm text-foreground">{insight}</p>
                    </motion.div>
                  ))}
                  <div className="pt-4 flex flex-col sm:flex-row gap-3">
                    <Button variant="hero" size="lg" asChild>
                      <Link to="/auth">Create Account to Save Report</Link>
                    </Button>
                    <Button variant="heroOutline" size="lg" asChild>
                      <Link to="/upgrade">Upgrade for Full Protocol</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Report;
