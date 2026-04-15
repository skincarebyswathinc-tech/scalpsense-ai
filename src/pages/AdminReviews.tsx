import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/landing/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { ShieldCheck, Star, Trash2, CheckCircle, XCircle } from "lucide-react";

interface Review {
  id: string;
  user_id: string | null;
  user_name: string | null;
  rating: number;
  review_text: string;
  result_highlight: string | null;
  is_approved: boolean;
  created_at: string;
}

const AdminReviews = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/auth"); return; }
    const check = async () => {
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin");
      if (data && data.length > 0) { setIsAdmin(true); fetchReviews(); }
      setChecking(false);
    };
    check();
  }, [user, authLoading]);

  const fetchReviews = async () => {
    const { data } = await supabase.from("user_reviews").select("*").order("created_at", { ascending: false });
    if (data) setReviews(data as unknown as Review[]);
  };

  const toggleApproval = async (review: Review) => {
    await supabase.from("user_reviews").update({ is_approved: !review.is_approved }).eq("id", review.id);
    fetchReviews();
    toast({ title: review.is_approved ? "Review hidden" : "Review approved" });
  };

  const deleteReview = async (id: string) => {
    await supabase.from("user_reviews").delete().eq("id", id);
    fetchReviews();
    toast({ title: "Review deleted" });
  };

  if (checking || authLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground font-body">Checking permissions…</p></div>;
  }
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 flex flex-col items-center justify-center gap-4">
          <ShieldCheck className="h-16 w-16 text-muted-foreground" />
          <h1 className="font-display text-2xl font-bold text-foreground">Admin Access Required</h1>
          <Button variant="outline" onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 container mx-auto px-4 max-w-4xl space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Review Moderation</h1>
          <p className="text-muted-foreground font-body text-sm mt-1">Approve reviews to show as testimonials on the landing page.</p>
        </div>

        {reviews.length === 0 && (
          <Card><CardContent className="p-8 text-center"><p className="text-muted-foreground font-body">No reviews yet.</p></CardContent></Card>
        )}

        <div className="space-y-3">
          {reviews.map((r) => (
            <Card key={r.id} className={`shadow-card ${!r.is_approved ? "opacity-70" : ""}`}>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-display font-bold text-foreground">{r.user_name || "Anonymous"}</span>
                      <div className="flex gap-0.5">
                        {Array.from({ length: r.rating }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-primary text-primary" />
                        ))}
                      </div>
                      {r.is_approved ? (
                        <Badge className="bg-primary/10 text-primary text-xs"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs"><XCircle className="h-3 w-3 mr-1" />Pending</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground font-body mt-1">{new Date(r.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={r.is_approved} onCheckedChange={() => toggleApproval(r)} />
                    <Button variant="ghost" size="sm" onClick={() => deleteReview(r.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </div>
                <p className="text-sm text-foreground font-body">{r.review_text}</p>
                {r.result_highlight && <Badge variant="secondary" className="text-xs">{r.result_highlight}</Badge>}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminReviews;
