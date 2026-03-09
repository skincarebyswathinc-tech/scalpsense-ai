import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/landing/Navbar";

const Report = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <div className="pt-32 pb-20 container mx-auto px-4 text-center max-w-lg space-y-6">
      <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
        Scalp Health Report
      </h1>
      <p className="text-muted-foreground font-body text-lg">
        Your detailed scalp health analysis will appear here after completing the diagnostic quiz.
      </p>
      <Button variant="hero" size="lg" asChild>
        <Link to="/quiz">Take the Quiz</Link>
      </Button>
    </div>
  </div>
);

export default Report;
