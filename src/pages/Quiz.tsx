import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/landing/Navbar";

const Quiz = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <div className="pt-32 pb-20 container mx-auto px-4 text-center max-w-lg space-y-6">
      <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
        Scalp Diagnostic Quiz
      </h1>
      <p className="text-muted-foreground font-body text-lg">
        Your personalized scalp assessment is coming soon. We're building an AI-powered quiz tailored to your needs.
      </p>
      <Button variant="heroOutline" size="lg" asChild>
        <Link to="/">Back to Home</Link>
      </Button>
    </div>
  </div>
);

export default Quiz;
