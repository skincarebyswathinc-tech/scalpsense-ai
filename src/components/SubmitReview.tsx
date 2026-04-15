import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Star, Send, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

const SubmitReview = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [userName, setUserName] = useState("");
  const [resultHighlight, setResultHighlight] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!reviewText.trim()) return;
    setLoading(true);
    const { error } = await supabase.from("user_reviews").insert({
      user_id: user?.id || null,
      user_name: userName.trim() || null,
      rating,
      review_text: reviewText.trim(),
      result_highlight: resultHighlight.trim() || null,
    });
    setLoading(false);
    if (error) {
      toast({ title: "Error submitting review", description: error.message, variant: "destructive" });
      return;
    }
    setSubmitted(true);
    toast({ title: "Thank you! 🎉", description: "Your review has been submitted for moderation." });
  };

  if (submitted) {
    return (
      <Card className="shadow-card max-w-md mx-auto">
        <CardContent className="p-8 text-center space-y-4">
          <CheckCircle className="h-12 w-12 text-primary mx-auto" />
          <h3 className="font-display text-xl font-bold text-foreground">Review Submitted!</h3>
          <p className="text-muted-foreground font-body text-sm">Your review will appear once approved. Thank you for sharing your experience!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="font-display text-lg">Share Your Experience</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label className="text-sm">Your Rating</Label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <button key={s} onClick={() => setRating(s)} className="focus:outline-none">
                <Star className={`w-6 h-6 ${s <= rating ? "fill-primary text-primary" : "text-muted"}`} />
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-sm">Your Name (optional)</Label>
          <Input value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="Jane D." />
        </div>
        <div className="space-y-2">
          <Label className="text-sm">Your Review</Label>
          <Textarea value={reviewText} onChange={(e) => setReviewText(e.target.value)} placeholder="How has ScalpSense helped you?" rows={3} />
        </div>
        <div className="space-y-2">
          <Label className="text-sm">Result Highlight (optional)</Label>
          <Input value={resultHighlight} onChange={(e) => setResultHighlight(e.target.value)} placeholder="e.g. Shedding reduced 50%" />
        </div>
        <Button variant="hero" className="w-full" onClick={handleSubmit} disabled={!reviewText.trim() || loading}>
          <Send className="mr-2 h-4 w-4" /> {loading ? "Submitting…" : "Submit Review"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default SubmitReview;
