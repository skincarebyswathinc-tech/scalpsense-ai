import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/landing/Navbar";
import { useToast } from "@/hooks/use-toast";
import {
  Sparkles, ArrowRight, Lock, CheckCircle, Share2,
  MessageCircle, Twitter, Copy, Check, AlertTriangle, TrendingUp,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";

// ─── Score helpers ───────────────────────────────────────────────
interface AssessmentData {
  hair_shedding: string;
  scalp_feel: string;
  symptoms: string[];
  hair_changes: string[];
  stress_level: string;
  sleep_hours: number;
}

const SHEDDING_SCORE: Record<string, number> = {
  less_than_50: 90, "50_100": 70, "100_150": 45, "150_plus": 20,
};
const SCALP_FEEL_LABEL: Record<string, string> = {
  dry: "Dry Scalp", balanced: "Balanced", slightly_oily: "Slightly Oily", very_oily: "Very Oily",
};
const SCALP_FEEL_SCORE: Record<string, number> = {
  dry: 55, balanced: 95, slightly_oily: 70, very_oily: 40,
};
const STRESS_SCORE: Record<string, number> = { low: 90, medium: 60, high: 30 };

function computeReport(d: AssessmentData) {
  const sheddingScore = SHEDDING_SCORE[d.hair_shedding] ?? 50;
  const scalpScore = SCALP_FEEL_SCORE[d.scalp_feel] ?? 50;
  const symptomPenalty = Math.min(d.symptoms.length * 8, 40);
  const changePenalty = Math.min(d.hair_changes.length * 10, 40);
  const stressScore = STRESS_SCORE[d.stress_level] ?? 50;
  const sleepScore = d.sleep_hours >= 7 ? 90 : d.sleep_hours >= 5 ? 60 : 30;

  const raw = (sheddingScore * 0.25 + scalpScore * 0.15 + (100 - symptomPenalty) * 0.2 +
    (100 - changePenalty) * 0.15 + stressScore * 0.15 + sleepScore * 0.1);
  const score = Math.round(Math.max(0, Math.min(100, raw)));

  const scalpType = SCALP_FEEL_LABEL[d.scalp_feel] || "Unknown";

  const issues: string[] = [];
  if (d.symptoms.length > 0) issues.push(`${d.symptoms.length} scalp symptom${d.symptoms.length > 1 ? "s" : ""} detected`);
  if (d.hair_changes.length > 0) issues.push(`${d.hair_changes.length} hair change pattern${d.hair_changes.length > 1 ? "s" : ""}`);
  if (d.hair_shedding === "150_plus") issues.push("Heavy hair shedding (150+ strands/day)");
  else if (d.hair_shedding === "100_150") issues.push("Moderate shedding (100-150 strands/day)");
  if (d.stress_level === "high") issues.push("High stress levels affecting scalp");
  if (d.sleep_hours < 6) issues.push("Insufficient sleep impacting recovery");
  if (d.scalp_feel === "very_oily") issues.push("Excess oil may clog follicles");
  if (d.scalp_feel === "dry") issues.push("Dry scalp may cause irritation");

  const improvement = score < 40 ? "High — significant improvement possible with the right protocol"
    : score < 65 ? "Moderate — targeted intervention can boost your score 20-30%"
    : score < 80 ? "Good — fine-tuning your routine can push you to excellent"
    : "Excellent — maintain your routine for lasting results";

  return { score, scalpType, issues, improvement };
}

// ─── Referral code generator ─────────────────────────────────────
function generateCode() {
  return "SS" + Math.random().toString(36).substring(2, 8).toUpperCase();
}

// ─── Component ───────────────────────────────────────────────────
const Report = () => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [captured, setCaptured] = useState(false);
  const [loading, setLoading] = useState(false);
  const [assessment, setAssessment] = useState<AssessmentData | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Track referral click
  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) {
      localStorage.setItem("referred_by", ref);
    }
  }, [searchParams]);

  useEffect(() => {
    const sid = localStorage.getItem("scalp_session_id");
    setSessionId(sid);
    const leadCaptured = localStorage.getItem("lead_captured");
    if (leadCaptured === "true") setCaptured(true);

    if (sid) {
      supabase
        .from("scalp_assessments")
        .select("hair_shedding, scalp_feel, symptoms, hair_changes, stress_level, sleep_hours")
        .eq("session_id", sid)
        .single()
        .then(({ data }) => {
          if (data) setAssessment(data as unknown as AssessmentData);
        });
    }
  }, []);

  // Generate or fetch referral code
  useEffect(() => {
    if (!sessionId || !captured) return;
    const storedCode = localStorage.getItem("referral_code");
    if (storedCode) {
      setReferralCode(storedCode);
      return;
    }
    const code = generateCode();
    supabase.from("referrals" as any).insert({
      referrer_session_id: sessionId, referral_code: code,
    } as any).then(() => {
      localStorage.setItem("referral_code", code);
      setReferralCode(code);
    });
  }, [sessionId, captured]);

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

  const report = assessment ? computeReport(assessment) : null;
  const shareUrl = referralCode
    ? `${window.location.origin}/quiz?ref=${referralCode}`
    : `${window.location.origin}/quiz`;
  const shareText = `I just checked my scalp health score${report ? ` — I got ${report.score}/100` : ""}. Take the free 60-second test and check yours here:`;

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

  // ─── Score ring color ──────────────────────────────────────
  const scoreColor = report
    ? report.score >= 75 ? "text-primary" : report.score >= 50 ? "text-amber-500" : "text-destructive"
    : "text-muted-foreground";

  // ─── Render ────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-28 pb-20 container mx-auto px-4 max-w-2xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
            Your Scalp Health Report
          </h1>
          {sessionId ? (
            <p className="text-muted-foreground font-body text-lg">
              {captured ? "Here are your personalized results." : "Enter your email to unlock your full report."}
            </p>
          ) : (
            <p className="text-muted-foreground font-body text-lg">
              Take the 60-second scalp quiz first to generate your report.
            </p>
          )}
        </div>

        {/* No quiz taken */}
        {!sessionId && (
          <div className="text-center">
            <Button variant="hero" size="xl" asChild>
              <Link to="/quiz">Start Free Scalp Test <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        )}

        {/* Quiz taken — show report */}
        {sessionId && report && (
          <>
            {/* ─── Score Card ──────────────────────────────── */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <Card className="shadow-elevated border-primary/20 bg-gradient-to-br from-card to-accent/20 overflow-hidden">
                <CardContent className="p-6 md:p-8">
                  <div className="flex flex-col items-center gap-6">
                    {/* Score Ring */}
                    <div className="relative w-40 h-40">
                      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                        <circle cx="60" cy="60" r="52" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
                        <circle
                          cx="60" cy="60" r="52" fill="none"
                          stroke={report.score >= 75 ? "hsl(var(--primary))" : report.score >= 50 ? "hsl(36 80% 55%)" : "hsl(var(--destructive))"}
                          strokeWidth="8" strokeLinecap="round"
                          strokeDasharray={`${(report.score / 100) * 327} 327`}
                          className="transition-all duration-1000"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-4xl font-display font-bold ${scoreColor}`}>{report.score}</span>
                        <span className="text-xs text-muted-foreground font-body">/100</span>
                      </div>
                    </div>
                    <div className="text-center space-y-1">
                      <p className="font-body text-xs uppercase tracking-wider text-muted-foreground">Scalp Health Score</p>
                      <p className="font-display text-xl font-bold text-foreground">
                        Scalp Type: <span className="text-primary">{report.scalpType}</span>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* ─── Preview section (always visible) ──────── */}
            <Card className="shadow-card">
              <CardContent className="p-6 space-y-4">
                <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" /> Key Issues Identified
                </h2>
                {report.issues.length === 0 ? (
                  <p className="font-body text-sm text-muted-foreground">No major issues detected — great job maintaining your scalp health!</p>
                ) : (
                  report.issues.slice(0, captured ? report.issues.length : 2).map((issue, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-start gap-3"
                    >
                      <CheckCircle className="h-5 w-5 text-destructive/70 flex-shrink-0 mt-0.5" />
                      <p className="font-body text-sm text-foreground">{issue}</p>
                    </motion.div>
                  ))
                )}
                {!captured && report.issues.length > 2 && (
                  <p className="font-body text-xs text-muted-foreground italic">
                    + {report.issues.length - 2} more issue{report.issues.length - 2 > 1 ? "s" : ""} — unlock to see all
                  </p>
                )}
              </CardContent>
            </Card>

            {/* ─── Locked or Full improvement section ───── */}
            {!captured ? (
              <div className="relative">
                <div className="pointer-events-none select-none blur-sm opacity-50">
                  <Card className="shadow-card">
                    <CardContent className="p-6 space-y-4">
                      <h2 className="font-display text-xl font-bold text-foreground">Improvement Potential</h2>
                      <p className="font-body text-sm">{report.improvement}</p>
                      <h2 className="font-display text-xl font-bold text-foreground">Full Analysis</h2>
                      <p className="font-body text-sm">Detailed symptom analysis & severity mapping</p>
                      <p className="font-body text-sm">Root cause identification</p>
                      <p className="font-body text-sm">Personalized 6-week recovery protocol</p>
                    </CardContent>
                  </Card>
                </div>
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <Card className="shadow-elevated border-primary/20 max-w-sm w-full">
                    <CardContent className="p-6 text-center space-y-4">
                      <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Lock className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="font-display text-xl font-bold text-foreground">Unlock Your Full Report</h3>
                      <p className="font-body text-sm text-muted-foreground">
                        Enter your email to see your complete analysis and personalized recovery plan.
                      </p>
                      <p className="font-body text-xs text-destructive font-medium">
                        Early intervention prevents long-term hair loss.
                      </p>
                      <form onSubmit={handleEmailCapture} className="space-y-3">
                        <Input
                          type="email" placeholder="Enter your email"
                          value={email} onChange={(e) => setEmail(e.target.value)}
                          className="h-12 rounded-xl font-body" required
                        />
                        <Button variant="hero" size="lg" className="w-full" type="submit" disabled={loading}>
                          {loading ? "Unlocking…" : "Unlock My Report →"}
                        </Button>
                      </form>
                      <p className="text-xs text-muted-foreground font-body">🔒 No spam. Unsubscribe anytime.</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <>
                {/* Improvement Potential */}
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                  <Card className="shadow-card border-primary/20">
                    <CardContent className="p-6 space-y-3">
                      <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" /> Improvement Potential
                      </h2>
                      <p className="font-body text-sm text-foreground">{report.improvement}</p>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Full Insights */}
                <Card className="shadow-card">
                  <CardContent className="p-6 space-y-4">
                    <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" /> Full Analysis
                    </h2>
                    {[
                      "Detailed symptom analysis & severity mapping",
                      "Root cause identification based on your profile",
                      "Personalized 6-week recovery protocol",
                      "Product & ingredient recommendations",
                      "Lifestyle modifications tailored for you",
                    ].map((insight, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className="flex items-start gap-3"
                      >
                        <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <p className="font-body text-sm text-foreground">{insight}</p>
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>

                {/* Share + CTA */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Dialog open={shareOpen} onOpenChange={setShareOpen}>
                    <DialogTrigger asChild>
                      <Button variant="hero" size="lg" className="flex-1">
                        <Share2 className="mr-2 h-4 w-4" /> Share My Scalp Score
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-sm">
                      <DialogHeader>
                        <DialogTitle className="font-display text-xl">Share Your Score</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 pt-2">
                        {/* Score preview */}
                        <div className="text-center p-4 bg-accent/30 rounded-xl">
                          <p className={`text-4xl font-display font-bold ${scoreColor}`}>{report.score}/100</p>
                          <p className="text-sm font-body text-muted-foreground mt-1">Scalp Health Score</p>
                        </div>

                        {/* Share buttons */}
                        <div className="grid grid-cols-1 gap-2">
                          <Button
                            variant="outline" className="w-full justify-start gap-3 h-12"
                            onClick={shareWhatsApp}
                          >
                            <MessageCircle className="h-5 w-5 text-green-600" />
                            <span className="font-body">Share on WhatsApp</span>
                          </Button>
                          <Button
                            variant="outline" className="w-full justify-start gap-3 h-12"
                            onClick={shareTwitter}
                          >
                            <Twitter className="h-5 w-5 text-sky-500" />
                            <span className="font-body">Share on Twitter</span>
                          </Button>
                          <Button
                            variant="outline" className="w-full justify-start gap-3 h-12"
                            onClick={() => {
                              navigator.clipboard.writeText(
                                `🔬 My Scalp Health Score: ${report.score}/100\n\nI just checked my scalp health. Take the free 60-second test:\n${shareUrl}`
                              );
                              toast({ title: "Copied! Paste to Instagram Stories or DMs." });
                            }}
                          >
                            <span className="text-lg">📸</span>
                            <span className="font-body">Copy for Instagram</span>
                          </Button>
                        </div>

                        {/* Copy link */}
                        <div className="flex gap-2">
                          <Input
                            readOnly value={shareUrl}
                            className="flex-1 text-xs font-body h-10"
                          />
                          <Button variant="outline" size="sm" onClick={copyLink} className="h-10 px-3">
                            {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                          </Button>
                        </div>

                        <p className="text-xs text-center text-muted-foreground font-body">
                          Your referral link tracks who you've helped discover their scalp health.
                        </p>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button variant="heroOutline" size="lg" asChild className="flex-1">
                    <Link to="/auth">Create Account to Save</Link>
                  </Button>
                </div>

                <div className="text-center">
                  <Button variant="hero" size="xl" asChild>
                    <Link to="/upgrade">
                      <Sparkles className="mr-2 h-4 w-4" /> Unlock Full Recovery Protocol
                    </Link>
                  </Button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Report;
