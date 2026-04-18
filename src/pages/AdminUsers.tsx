import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/landing/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { InfoTip } from "@/components/ui/info-tip";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, Crown, ShieldCheck, Search, Loader2, UserCog } from "lucide-react";

interface AdminUser {
  id: string;
  email: string | null;
  display_name: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  is_active: boolean;
  plan: "free" | "premium";
  status: string;
  expires_at: string | null;
  payment_provider: string | null;
  is_paid_customer: boolean;
}

const AdminUsers = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<{ user: AdminUser; nextPlan: "free" | "premium" } | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/auth"); return; }
    (async () => {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin");
      const ok = !!data?.length;
      setIsAdmin(ok);
      setChecking(false);
      if (ok) fetchUsers();
    })();
  }, [user, authLoading]);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase.functions.invoke("admin-users", { method: "GET" });
    if (error) {
      toast({ title: "Failed to load users", description: error.message, variant: "destructive" });
    } else if (data?.users) {
      setUsers(data.users);
    }
    setLoading(false);
  };

  const togglePlan = async (target: AdminUser, force = false) => {
    const nextPlan = target.plan === "premium" ? "free" : "premium";
    setBusyId(target.id);
    const { data, error } = await supabase.functions.invoke("admin-users", {
      method: "POST",
      body: { user_id: target.id, plan: nextPlan, force },
    });
    setBusyId(null);
    if (error || (data && (data as any).error)) {
      const msg = error?.message || (data as any)?.error || "Failed";
      // 409 from edge function = trying to overwrite a real paid customer
      if (msg.toLowerCase().includes("payment")) {
        setConfirm({ user: target, nextPlan });
      } else {
        toast({ title: "Update failed", description: msg, variant: "destructive" });
      }
      return;
    }
    toast({ title: "Updated", description: `${target.email || target.id} → ${nextPlan}` });
    setUsers(prev => prev.map(u => u.id === target.id ? { ...u, plan: nextPlan, payment_provider: "admin_manual" } : u));
    setConfirm(null);
  };

  const filtered = users.filter(u => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      u.email?.toLowerCase().includes(q) ||
      u.display_name?.toLowerCase().includes(q) ||
      u.id.toLowerCase().includes(q)
    );
  });

  if (checking || authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground font-body">Checking permissions…</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 flex flex-col items-center justify-center gap-4">
          <ShieldCheck className="h-16 w-16 text-muted-foreground" />
          <h1 className="font-display text-2xl font-bold">Admin Access Required</h1>
          <Button variant="outline" onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  const premiumCount = users.filter(u => u.plan === "premium").length;
  const paidCount = users.filter(u => u.is_paid_customer).length;
  const manualCount = users.filter(u => u.plan === "premium" && u.payment_provider === "admin_manual").length;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 container mx-auto px-4 max-w-6xl space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="font-display text-2xl font-bold flex items-center gap-2">
              <UserCog className="h-6 w-6 text-primary" /> Users Management
            </h1>
            <p className="text-muted-foreground text-sm">
              View all registered users and manually grant or revoke premium access.
              Real Razorpay-driven upgrades are protected from accidental overwrite.
            </p>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Users", value: users.length, tip: "All users with an account in the system." },
            { label: "Premium", value: premiumCount, tip: "Users currently on the premium plan (paid + admin-granted combined)." },
            { label: "Paid Customers", value: paidCount, tip: "Users who upgraded via Razorpay or other real payment. Protected from manual downgrade." },
            { label: "Admin-granted", value: manualCount, tip: "Premium accesses you granted manually from this page." },
          ].map(s => (
            <Card key={s.label} className="shadow-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</p>
                  <InfoTip>{s.tip}</InfoTip>
                </div>
                <p className="font-display text-2xl font-bold mt-1">{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <CardTitle className="font-display flex items-center gap-2">
                  All Users
                  <InfoTip>
                    Toggle the switch in the Plan column to grant or revoke
                    premium. We never overwrite users who paid through Razorpay
                    — you'll be asked to confirm before overriding a real
                    payment.
                  </InfoTip>
                </CardTitle>
                <CardDescription>{filtered.length} of {users.length} users shown</CardDescription>
              </div>
              <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search email, name, or ID…"
                  className="pl-9"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : filtered.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No users match your search.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-xs uppercase text-muted-foreground">
                      <th className="py-2 pr-4 font-medium">User</th>
                      <th className="py-2 pr-4 font-medium">Joined</th>
                      <th className="py-2 pr-4 font-medium">Plan</th>
                      <th className="py-2 pr-4 font-medium">Source</th>
                      <th className="py-2 pr-4 font-medium text-right">Toggle Premium</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(u => (
                      <tr key={u.id} className="border-b hover:bg-muted/30">
                        <td className="py-3 pr-4">
                          <div className="font-medium text-foreground">{u.email || "(no email)"}</div>
                          <div className="text-xs text-muted-foreground">{u.display_name || u.id.slice(0, 8)}</div>
                        </td>
                        <td className="py-3 pr-4 text-muted-foreground text-xs">
                          {new Date(u.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 pr-4">
                          {u.plan === "premium" ? (
                            <Badge className="bg-primary/15 text-primary gap-1">
                              <Crown className="h-3 w-3" /> Premium
                            </Badge>
                          ) : (
                            <Badge variant="outline">Free</Badge>
                          )}
                        </td>
                        <td className="py-3 pr-4">
                          {u.is_paid_customer ? (
                            <Badge variant="secondary" className="text-xs">
                              Paid · {u.payment_provider}
                            </Badge>
                          ) : u.payment_provider === "admin_manual" ? (
                            <Badge variant="outline" className="text-xs">Admin-granted</Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="py-3 pr-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            {busyId === u.id && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
                            <Switch
                              checked={u.plan === "premium"}
                              disabled={busyId === u.id}
                              onCheckedChange={() => togglePlan(u)}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Override paid customer?</AlertDialogTitle>
            <AlertDialogDescription>
              {confirm?.user.email} upgraded via{" "}
              <span className="font-mono">{confirm?.user.payment_provider}</span>.
              Changing their plan will overwrite that real payment record.
              Are you sure?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirm && togglePlan(confirm.user, true)}
            >
              Yes, override
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminUsers;
