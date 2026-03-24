import { useState, useEffect } from "react";
import { X, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const UrgencyBanner = () => {
  const [visible, setVisible] = useState(true);
  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 59, seconds: 59 });

  useEffect(() => {
    // Calculate time until midnight
    const updateTimer = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft({ hours, minutes, seconds });
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!visible) return null;

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="bg-primary text-primary-foreground"
      >
        <div className="container mx-auto px-4 py-2 flex items-center justify-center gap-3 text-sm font-body relative">
          <Clock className="h-4 w-4 shrink-0" />
          <span className="font-semibold">Limited Time: Get 20% off Premium today</span>
          <span className="hidden sm:inline">—</span>
          <span className="font-mono text-xs bg-primary-foreground/20 rounded px-2 py-0.5">
            {pad(timeLeft.hours)}:{pad(timeLeft.minutes)}:{pad(timeLeft.seconds)}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="text-primary-foreground hover:bg-primary-foreground/20 h-6 px-2 ml-2"
            asChild
          >
            <Link to="/upgrade">Claim Offer →</Link>
          </Button>
          <button
            onClick={() => setVisible(false)}
            className="absolute right-4 text-primary-foreground/70 hover:text-primary-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default UrgencyBanner;
