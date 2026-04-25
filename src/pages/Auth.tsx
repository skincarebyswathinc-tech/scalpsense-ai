import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/landing/Navbar";
import { Separator } from "@/components/ui/separator";
import { getPasswordError, PASSWORD_HELP_TEXT } from "@/lib/passwordPolicy";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (error) throw error;
    } catch (error) {
      toast({ title: "Google sign-in failed", description: error instanceof Error ? error.message : String(error), variant: "destructive" });
    }
  };
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) {
      toast({ title: "Missing details", description: "Enter both email and password.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password });
      if (error) throw error;
      navigate("/dashboard");
    } catch (error) {
      toast({ title: "Login failed", description: error instanceof Error ? error.message : "Please check your details and try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    const passwordError = getPasswordError(password, [displayName, normalizedEmail.split("@")[0]]);
    if (!displayName.trim() || !normalizedEmail) {
      toast({ title: "Missing details", description: "Enter your name and email to continue.", variant: "destructive" });
      return;
    }
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
      const { data: signupData, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password: password.trim(),
        options: {
          data: { display_name: displayName.trim() },
          emailRedirectTo: window.location.origin,
        },
      });
      if (error) throw error;
      // Handle referral conversion
      const refCode = localStorage.getItem("referred_by");
      if (refCode && signupData?.user) {
        // Look up referrer
        const { data: refData } = await supabase
          .from("referrals" as any)
          .select("user_id")
          .eq("referral_code", refCode)
          .maybeSingle();

        if (refData && (refData as any).user_id) {
          const referrerUserId = (refData as any).user_id;
          // Record conversion
          await supabase.from("referral_conversions" as any).insert({
            referral_code: refCode,
            referred_user_id: signupData.user.id,
            referrer_user_id: referrerUserId,
          } as any);

          // Extend referrer's premium by 7 days
          const { data: sub } = await supabase
            .from("subscriptions" as any)
            .select("id, plan, expires_at")
            .eq("user_id", referrerUserId)
            .maybeSingle();

          if (sub) {
            const s = sub as any;
            const currentExpiry = s.expires_at ? new Date(s.expires_at) : new Date();
            const newExpiry = new Date(Math.max(currentExpiry.getTime(), Date.now()));
            newExpiry.setDate(newExpiry.getDate() + 7);
            await supabase.from("subscriptions" as any)
              .update({ plan: "premium", expires_at: newExpiry.toISOString() } as any)
              .eq("id", s.id);
          }

          localStorage.removeItem("referred_by");
        }
      }
      toast({ title: "Check your email", description: "We sent you a verification link to confirm your account." });
    } catch (error) {
      toast({ title: "Signup failed", description: error instanceof Error ? error.message : "Please try again in a moment.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-28 pb-20 container mx-auto px-4 flex justify-center">
        <Card className="w-full max-w-md shadow-card">
          <CardHeader className="text-center">
            <CardTitle className="font-display text-2xl">Welcome to ScalpSense</CardTitle>
            <CardDescription className="font-body">Sign in to track your scalp health journey</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Log In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full mb-4 gap-2"
                  onClick={handleGoogleSignIn}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                  Continue with Google
                </Button>
                <div className="relative mb-4">
                  <Separator />
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">or</span>
                </div>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input id="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input id="login-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  </div>
                  <Button type="submit" variant="hero" className="w-full" disabled={loading}>
                    {loading ? "Signing in…" : "Log In"}
                  </Button>
                  <div className="text-center">
                    <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                      Forgot your password?
                    </Link>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full mb-4 gap-2"
                  onClick={handleGoogleSignIn}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                  Continue with Google
                </Button>
                <div className="relative mb-4">
                  <Separator />
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">or</span>
                </div>
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Display Name</Label>
                    <Input id="signup-name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input id="signup-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input id="signup-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
                    <p className="text-xs text-muted-foreground">{PASSWORD_HELP_TEXT}</p>
                  </div>
                  <Button type="submit" variant="hero" className="w-full" disabled={loading}>
                    {loading ? "Creating account…" : "Sign Up"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
