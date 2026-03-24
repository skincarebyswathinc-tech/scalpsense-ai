import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import heroImage from "@/assets/hero-illustration.jpg";
import { Shield, Users, Award, Clock } from "lucide-react";

const stats = [
  { value: "50K+", label: "Scalp Tests Taken" },
  { value: "82%", label: "Saw Improvement in 6 Weeks" },
  { value: "60s", label: "Quick Assessment" },
];

const trustBadges = [
  { icon: Shield, label: "Clinically Informed" },
  { icon: Users, label: "50,000+ Users" },
  { icon: Award, label: "Dermatologist Reviewed" },
  { icon: Clock, label: "60-Second Test" },
];

const HeroSection = () => {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="space-y-6"
          >
            {/* Social proof pill */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="inline-flex items-center gap-2 bg-accent/60 border border-border rounded-full px-4 py-1.5"
            >
              <span className="flex -space-x-1.5">
                {[1, 2, 3].map((i) => (
                  <span key={i} className="w-5 h-5 rounded-full bg-primary/30 border-2 border-card" />
                ))}
              </span>
              <span className="text-xs font-body font-medium text-foreground">
                2,847 people took the test this week
              </span>
            </motion.div>

            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight text-balance">
              Take the 60-Second{" "}
              <span className="text-primary">Scalp Health Test</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground font-body max-w-lg leading-relaxed">
              Discover why your hair is thinning and how to fix it — backed by science, personalized for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Button variant="hero" size="xl" asChild>
                <Link to="/quiz">Start Free Scalp Test →</Link>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground font-body">
              ✦ 100% Free • No account needed • 30-day money-back guarantee
            </p>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-4 pt-4">
              {trustBadges.map((badge) => (
                <div key={badge.label} className="flex items-center gap-1.5 text-xs font-body text-muted-foreground">
                  <badge.icon className="w-3.5 h-3.5 text-primary" />
                  <span>{badge.label}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex justify-center"
          >
            <div className="relative">
              <div className="absolute -inset-4 bg-sage-light rounded-full blur-3xl opacity-40" />
              <img
                src={heroImage}
                alt="Woman with healthy hair surrounded by botanical elements"
                className="relative rounded-3xl shadow-elevated w-full max-w-md"
              />
              {/* Floating stat card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="absolute -bottom-4 -left-4 bg-card border border-border rounded-xl shadow-elevated px-4 py-3"
              >
                <p className="text-2xl font-display font-bold text-primary">82%</p>
                <p className="text-xs font-body text-muted-foreground">improved in 6 weeks</p>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="flex justify-center gap-8 md:gap-16 mt-16 pt-8 border-t border-border"
        >
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-2xl md:text-3xl font-display font-bold text-foreground">{s.value}</p>
              <p className="text-xs md:text-sm font-body text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
