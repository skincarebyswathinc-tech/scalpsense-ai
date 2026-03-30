import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/landing/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from "@/hooks/useSubscription";
import { User, Mail, Calendar, Activity, Crown, Pencil, Save, Loader2, AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const Profile = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const { isPremium } = useSubscription();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [profile, setProfile] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [saving, setSaving] = useState(false);
  const [deactivateOpen, setDeactivateOpen] = useState(false);

  // Activity data
  const [quizCount, setQuizCount] = useState(0);
  const [habitStreak, setHabitStreak] = useState(0);
  const [photoCount, setPhotoCount] = useState(0);
  const [reportCount, setReportCount] = useState(0);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/auth"); return; }
    fetchProfile();
    fetchActivity();
  }, [user, authLoading]);

  const fetchProfile = async () => {
    if (!user) return;
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    if (data) {
      setProfile(data);
      setDisplayName(data.display_name || "");
    }
  };

  const fetchActivity = async () => {
    if (!user) return;
    const [reports, photos, completions] = await Promise.all([
      supabase.from("user_reports").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("scalp_progress_photos").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("habit_completions").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    ]);
    setReportCount(reports.count || 0);
    setPhotoCount(photos.count || 0);
    setHabitStreak(completions.count || 0);
  };

  const saveProfile = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ display_name: displayName }).eq("id", user.id);
    setSaving(false);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Profile updated" });
    setEditMode(false);
    fetchProfile();
  };

  const deactivateAccount = async () => {
    if (!user) return;
    await supabase.from("profiles").update({
      is_active: false,
      deactivated_at: new Date().toISOString(),
    } as any).eq("id", user.id);
    toast({ title: "Account deactivated", description: "Your data is preserved. Contact support to reactivate." });
    await signOut();
    navigate("/");
  };

  if (authLoading || !user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 container mx-auto px-4 max-w-3xl space-y-6">
        <h1 className="font-display text-3xl font-bold text-foreground">My Profile</h1>

        {/* Profile Card */}
        <Card className="shadow-card">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div>
                  {editMode ? (
                    <div className="flex items-center gap-2">
                      <Input value={displayName} onChange={e => setDisplayName(e.target.value)} className="w-48" />
                      <Button size="sm" onClick={saveProfile} disabled={saving}>
                        {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                      </Button>
                    </div>
                  ) : (
                    <h2 className="font-display text-xl font-bold text-foreground">{profile?.display_name || "User"}</h2>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <Mail className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Joined {new Date(user.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={isPremium ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}>
                  {isPremium ? <><Crown className="h-3 w-3 mr-1" />Premium</> : "Free"}
                </Badge>
                {!editMode && <Button variant="ghost" size="sm" onClick={() => setEditMode(true)}><Pencil className="h-4 w-4" /></Button>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity History */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" /> Activity History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Assessments", value: reportCount },
                { label: "Progress Photos", value: photoCount },
                { label: "Habits Completed", value: habitStreak },
                { label: "Plan", value: isPremium ? "Premium" : "Free" },
              ].map(item => (
                <div key={item.label} className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="font-display text-2xl font-bold text-foreground">{item.value}</p>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="shadow-card border-destructive/20">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="font-display font-bold text-foreground">Deactivate Account</p>
              <p className="text-xs text-muted-foreground">Your data will be preserved but your account will be inactive.</p>
            </div>
            <Button variant="outline" className="border-destructive text-destructive" onClick={() => setDeactivateOpen(true)}>
              Deactivate
            </Button>
          </CardContent>
        </Card>

        <Dialog open={deactivateOpen} onOpenChange={setDeactivateOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-display flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" /> Deactivate Account?
              </DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              This will mark your account as inactive. Your data will be preserved and you can contact support to reactivate.
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setDeactivateOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={deactivateAccount}>Deactivate</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Profile;
