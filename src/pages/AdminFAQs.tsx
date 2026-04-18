import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/landing/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { FieldHelp } from "@/components/ui/field-help";
import { ShieldCheck, Plus, Pencil, Trash2, ArrowUp, ArrowDown } from "lucide-react";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
  is_active: boolean;
}

const AdminFAQs = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<FAQ | null>(null);
  const [form, setForm] = useState({ question: "", answer: "", sort_order: 0, is_active: true });

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/auth"); return; }
    const check = async () => {
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin");
      if (data && data.length > 0) { setIsAdmin(true); fetchFAQs(); }
      setChecking(false);
    };
    check();
  }, [user, authLoading]);

  const fetchFAQs = async () => {
    const { data } = await supabase.from("faqs").select("*").order("sort_order");
    if (data) setFaqs(data as unknown as FAQ[]);
  };

  const openEdit = (faq: FAQ) => {
    setEditing(faq);
    setForm({ question: faq.question, answer: faq.answer, sort_order: faq.sort_order, is_active: faq.is_active });
    setDialogOpen(true);
  };

  const openNew = () => {
    setEditing(null);
    setForm({ question: "", answer: "", sort_order: faqs.length, is_active: true });
    setDialogOpen(true);
  };

  const save = async () => {
    if (editing) {
      const { error } = await supabase.from("faqs").update(form).eq("id", editing.id);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      toast({ title: "FAQ updated" });
    } else {
      const { error } = await supabase.from("faqs").insert(form);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      toast({ title: "FAQ added" });
    }
    setDialogOpen(false);
    fetchFAQs();
  };

  const deleteFAQ = async (id: string) => {
    await supabase.from("faqs").delete().eq("id", id);
    fetchFAQs();
    toast({ title: "FAQ deleted" });
  };

  const toggleActive = async (faq: FAQ) => {
    await supabase.from("faqs").update({ is_active: !faq.is_active }).eq("id", faq.id);
    fetchFAQs();
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
            <h1 className="font-display text-3xl font-bold text-foreground">FAQ Management</h1>
            <p className="text-muted-foreground font-body text-sm mt-1">Manage frequently asked questions shown on the landing page.</p>
          </div>
          <Button variant="hero" onClick={openNew}><Plus className="mr-2 h-4 w-4" /> Add FAQ</Button>
        </div>

        <div className="space-y-3">
          {faqs.map((faq) => (
            <Card key={faq.id} className={`shadow-card ${!faq.is_active ? "opacity-50" : ""}`}>
              <CardContent className="p-4 flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="font-display font-bold text-foreground text-sm">{faq.question}</p>
                  <p className="text-xs text-muted-foreground font-body mt-1 line-clamp-2">{faq.answer}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Switch checked={faq.is_active} onCheckedChange={() => toggleActive(faq)} />
                  <Button variant="ghost" size="sm" onClick={() => openEdit(faq)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => deleteFAQ(faq.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-display">{editing ? "Edit FAQ" : "Add FAQ"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="faq-q">Question <span className="text-destructive">*</span></Label>
                <FieldHelp id="faq-q-desc">Phrased as a real user question. Keep it under ~120 characters.</FieldHelp>
                <Input
                  id="faq-q"
                  aria-describedby="faq-q-desc"
                  value={form.question}
                  onChange={(e) => setForm({ ...form, question: e.target.value })}
                  placeholder="e.g. How long until I see results?"
                  maxLength={200}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="faq-a">Answer <span className="text-destructive">*</span></Label>
                <FieldHelp id="faq-a-desc">Plain-language reply. You can use multiple sentences.</FieldHelp>
                <Textarea
                  id="faq-a"
                  aria-describedby="faq-a-desc"
                  value={form.answer}
                  onChange={(e) => setForm({ ...form, answer: e.target.value })}
                  rows={4}
                  maxLength={1000}
                  placeholder="e.g. Most users see initial improvements within 4–6 weeks of consistent use."
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="faq-sort">Sort Order</Label>
                <FieldHelp id="faq-sort-desc">Lower numbers appear first in the FAQ list.</FieldHelp>
                <Input
                  id="faq-sort"
                  aria-describedby="faq-sort-desc"
                  type="number"
                  value={form.sort_order}
                  onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="sticky bottom-0 -mx-6 px-6 py-3 bg-background border-t">
                <Button variant="hero" className="w-full" onClick={save} disabled={!form.question.trim() || !form.answer.trim()}>
                  {editing ? "Save Changes" : "Add FAQ"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminFAQs;
