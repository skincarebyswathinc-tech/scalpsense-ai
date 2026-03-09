import Navbar from "@/components/landing/Navbar";
import QuizFlow from "@/components/quiz/QuizFlow";

const Quiz = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <div className="pt-28 pb-20 container mx-auto px-4">
      <div className="text-center mb-10">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
          Scalp Health Scan
        </h1>
        <p className="text-muted-foreground font-body text-lg mt-2">
          Answer a few questions to get your personalized scalp assessment
        </p>
      </div>
      <QuizFlow />
    </div>
  </div>
);

export default Quiz;
