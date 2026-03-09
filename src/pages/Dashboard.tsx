import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/landing/Navbar";

const Dashboard = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <div className="pt-32 pb-20 container mx-auto px-4 text-center max-w-lg space-y-6">
      <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
        Your Dashboard
      </h1>
      <p className="text-muted-foreground font-body text-lg">
        Track your scalp health journey. Log in to view your progress, reports, and recovery plan.
      </p>
      <Button variant="hero" size="lg" asChild>
        <Link to="/quiz">Get Started</Link>
      </Button>
    </div>
  </div>
);

export default Dashboard;
