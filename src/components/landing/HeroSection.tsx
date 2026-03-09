import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import heroImage from "@/assets/hero-illustration.jpg";

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
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight text-balance">
              Understand Your Scalp.{" "}
              <span className="text-primary">Restore Your Hair.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground font-body max-w-lg leading-relaxed">
              Take a 60-second scalp health test and get a personalized hair recovery plan.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Button variant="hero" size="xl" asChild>
                <Link to="/quiz">Start Scalp Scan</Link>
              </Button>
              <Button variant="heroOutline" size="xl" asChild>
                <Link to="/report">View Sample Report</Link>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground font-body">
              ✦ Free • No account needed • Results in 60 seconds
            </p>
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
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
