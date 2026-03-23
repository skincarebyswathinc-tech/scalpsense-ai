import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const EmailCapture = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);

    const { error } = await supabase.from("leads" as any).upsert(
      { email: email.trim(), name: name.trim() || null, source: "landing" } as any,
      { onConflict: "email" }
    );

    setLoading(false);

    if (error) {
      toast({ title: "Something went wrong", description: error.message, variant: "destructive" });
      return;
    }

    setSubmitted(true);
    toast({ title: "You're in! 🎉", description: "Check your inbox for scalp care tips." });
  };

  if (submitted) {
    return (
      <section className="py-20 md:py-28 bg-gradient-to-b from-secondary/50 to-accent/20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-lg mx-auto text-center space-y-6"
          >
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h2 className="font-display text-3xl font-bold text-foreground">
              You're on the List!
            </h2>
            <p className="text-muted-foreground font-body">
              Ready to find out what's happening with your scalp?
            </p>
            <Button variant="hero" size="xl" asChild>
              <Link to="/quiz">Start Free Scalp Test <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-secondary/50 to-accent/20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-lg mx-auto text-center space-y-6"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
            Get Your Free Scalp Analysis
          </h2>
          <p className="text-muted-foreground font-body text-lg">
            Enter your email to unlock your personalized scalp health report and recovery plan.
          </p>
          <p className="text-xs text-destructive font-body font-medium">
            ⚠️ Early intervention prevents long-term hair loss. Don't wait.
          </p>
          <form onSubmit={handleSubmit} className="space-y-3">
            <Input
              type="text"
              placeholder="Your name (optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-12 rounded-xl bg-card border-border font-body"
            />
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 rounded-xl bg-card border-border font-body"
              required
            />
            <Button variant="hero" size="lg" type="submit" className="w-full" disabled={loading}>
              {loading ? "Saving…" : "Unlock My Free Report →"}
            </Button>
          </form>
          <p className="text-xs text-muted-foreground font-body">
            🔒 No spam, ever. Unsubscribe anytime. Your data is private.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default EmailCapture;
