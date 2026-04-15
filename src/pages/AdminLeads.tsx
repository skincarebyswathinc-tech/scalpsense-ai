import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/landing/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ShieldCheck, Mail, Users, Search, Download } from "lucide-react";

interface Lead {
  id: string;
  email: string;
  name: string | null;
  source: string | null;
  created_at: string;
}

const AdminLeads = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/auth"); return; }
    const check = async () => {
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin");
      if (data && data.length > 0) { setIsAdmin(true); fetchLeads(); }
      setChecking(false);
    };
    check();
  }, [user, authLoading]);

  const fetchLeads = async () => {
    const { data } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
    if (data) setLeads(data as unknown as Lead[]);
  };

  const filtered = leads.filter(l =>
    l.email.toLowerCase().includes(search.toLowerCase()) ||
    (l.name || "").toLowerCase().includes(search.toLowerCase())
  );

  const exportCSV = () => {
    const csv = "Name,Email,Source,Date\n" + filtered.map(l =>
      `"${l.name || ""}","${l.email}","${l.source || ""}","${new Date(l.created_at).toLocaleDateString()}"`
    ).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "leads.csv";
    a.click();
    URL.revokeObjectURL(url);
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Email Leads</h1>
            <p className="text-muted-foreground font-body text-sm mt-1">{leads.length} captured leads</p>
          </div>
          <Button variant="outline" onClick={exportCSV}><Download className="mr-2 h-4 w-4" /> Export CSV</Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="space-y-2">
          {filtered.map((l) => (
            <Card key={l.id} className="shadow-card">
              <CardContent className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-primary shrink-0" />
                  <div>
                    <p className="font-body text-sm font-medium text-foreground">{l.email}</p>
                    <p className="text-xs text-muted-foreground font-body">{l.name || "—"} · {l.source}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground font-body shrink-0">{new Date(l.created_at).toLocaleDateString()}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {filtered.length === 0 && (
          <Card><CardContent className="p-8 text-center"><p className="text-muted-foreground font-body">No leads found.</p></CardContent></Card>
        )}
      </div>
    </div>
  );
};

export default AdminLeads;
