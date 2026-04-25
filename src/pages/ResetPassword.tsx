import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/landing/Navbar";
import { Lock } from "lucide-react";
import { getPasswordError, PASSWORD_HELP_TEXT } from "@/lib/passwordPolicy";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check for recovery event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsRecovery(true);
      }
    });

    // Also check hash for type=recovery
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) {
      setIsRecovery(true);
    }

    return () => subscription.unsubscribe();
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    const passwordError = getPasswordError(password);
    if (passwordError) {
      toast({
        title: "Weak password",
        description: passwordError,
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: password.trim() });
      if (error) throw error;
      toast({ title: "Password updated!", description: "You can now log in with your new password." });
      navigate("/dashboard");
    } catch (error) {
      toast({ title: "Password update failed", description: error instanceof Error ? error.message : "Please request a fresh reset link and try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (!isRecovery) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-28 pb-20 container mx-auto px-4 flex justify-center">
          <Card className="w-full max-w-md shadow-card">
            <CardContent className="p-6 text-center space-y-4">
              <Lock className="h-12 w-12 text-muted-foreground mx-auto" />
              <p className="text-muted-foreground">
                This page is only accessible via a password reset link. Check your email.
              </p>
              <Button variant="hero" onClick={() => navigate("/auth")}>
                Go to Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-28 pb-20 container mx-auto px-4 flex justify-center">
        <Card className="w-full max-w-md shadow-card">
          <CardHeader className="text-center">
            <CardTitle className="font-display text-2xl">Set New Password</CardTitle>
            <CardDescription>Enter your new password below</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password" type="password"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  required minLength={8}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password" type="password"
                  value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  required minLength={8}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {PASSWORD_HELP_TEXT}
              </p>
              <Button type="submit" variant="hero" className="w-full" disabled={loading}>
                {loading ? "Updating…" : "Update Password"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
