import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/landing/Navbar";
import PremiumGate from "@/components/PremiumGate";

const Protocol = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <div className="pt-32 pb-20 container mx-auto px-4 text-center max-w-lg space-y-6">
      <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
        6-Week Recovery Protocol
      </h1>
      <PremiumGate feature="Full Recovery Protocol" blur={false}>
        <p className="text-muted-foreground font-body text-lg">
          Your personalized recovery plan will be available here based on your scalp health report.
        </p>
        <Button variant="hero" size="lg" asChild>
          <Link to="/quiz">Start with the Quiz</Link>
        </Button>
      </PremiumGate>
    </div>
  </div>
);

export default Protocol;
