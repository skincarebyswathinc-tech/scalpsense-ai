import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/landing/Navbar";
import { ArrowLeft, Mail } from "lucide-react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setSent(true);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-28 pb-20 container mx-auto px-4 flex justify-center">
        <Card className="w-full max-w-md shadow-card">
          <CardHeader className="text-center">
            <CardTitle className="font-display text-2xl">Reset Password</CardTitle>
            <CardDescription>We'll send you a link to reset your password</CardDescription>
          </CardHeader>
          <CardContent>
            {sent ? (
              <div className="text-center space-y-4">
                <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Check your email for a password reset link. It may take a minute to arrive.
                </p>
                <Button variant="ghost" asChild>
                  <Link to="/auth"><ArrowLeft className="h-4 w-4 mr-1" /> Back to Login</Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">Email</Label>
                  <Input
                    id="reset-email" type="email"
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    required placeholder="your@email.com"
                  />
                </div>
                <Button type="submit" variant="hero" className="w-full" disabled={loading}>
                  {loading ? "Sending…" : "Send Reset Link"}
                </Button>
                <Button variant="ghost" className="w-full" asChild>
                  <Link to="/auth"><ArrowLeft className="h-4 w-4 mr-1" /> Back to Login</Link>
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;
