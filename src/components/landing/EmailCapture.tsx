import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";

const EmailCapture = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    toast.success("You're on the list! We'll be in touch soon.");
    setEmail("");
  };

  return (
    <section className="py-20 md:py-28 bg-secondary/50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-lg mx-auto text-center space-y-6"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
            Stay in the Loop
          </h2>
          <p className="text-muted-foreground font-body text-lg">
            Get scalp care tips, product alerts, and early access to new features.
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 h-12 rounded-xl bg-card border-border font-body"
              required
            />
            <Button variant="hero" size="lg" type="submit">
              Subscribe
            </Button>
          </form>
          <p className="text-xs text-muted-foreground font-body">
            No spam, ever. Unsubscribe anytime.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default EmailCapture;
