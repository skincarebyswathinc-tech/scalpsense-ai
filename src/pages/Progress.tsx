import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/landing/Navbar";
import { useToast } from "@/hooks/use-toast";
import { Camera, TrendingDown, Activity, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar,
} from "recharts";

const SYMPTOM_OPTIONS = [
  "Itching", "Flaking", "Redness", "Oiliness", "Dryness",
  "Thinning", "Burning", "Tenderness", "Bumps", "Odor",
];

const Progress = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Hair fall
  const [hairLogs, setHairLogs] = useState<{ count: number; logged_at: string }[]>([]);
  const [hairFallCount, setHairFallCount] = useState("");
  const [hairFallOpen, setHairFallOpen] = useState(false);

  // Symptoms
  const [symptomLogs, setSymptomLogs] = useState<{ symptoms: string[]; severity: number; logged_at: string }[]>([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [severity, setSeverity] = useState("3");
  const [symptomNotes, setSymptomNotes] = useState("");
  const [symptomOpen, setSymptomOpen] = useState(false);

  // Photos
  const [photos, setPhotos] = useState<{ photo_url: string; week_number: number; uploaded_at: string; photo_type: string }[]>([]);
  const [photoOpen, setPhotoOpen] = useState(false);
  const [photoWeek, setPhotoWeek] = useState("1");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Before-after slider
  const [sliderPos, setSliderPos] = useState(50);
  const sliderContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const [hRes, sRes, pRes] = await Promise.all([
        supabase.from("hair_fall_logs").select("count, logged_at").eq("user_id", user.id).order("logged_at"),
        supabase.from("symptom_logs").select("symptoms, severity, logged_at").eq("user_id", user.id).order("logged_at"),
        supabase.from("scalp_progress_photos").select("photo_url, week_number, uploaded_at, photo_type").eq("user_id", user.id).order("uploaded_at"),
      ]);
      if (hRes.data) setHairLogs(hRes.data);
      if (sRes.data) setSymptomLogs(sRes.data);
      if (pRes.data) setPhotos(pRes.data);
    };
    load();
  }, [user]);

  // Chart data
  const hairChartData = hairLogs.map((l) => ({
    date: new Date(l.logged_at).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    count: l.count,
  }));

  const symptomChartData = symptomLogs.map((l) => ({
    date: new Date(l.logged_at).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    severity: l.severity,
    count: l.symptoms.length,
  }));

  // Before/after photos
  const sortedPhotos = [...photos].sort((a, b) => new Date(a.uploaded_at).getTime() - new Date(b.uploaded_at).getTime());
  const beforePhoto = sortedPhotos[0];
  const afterPhoto = sortedPhotos.length > 1 ? sortedPhotos[sortedPhotos.length - 1] : null;

  const submitHairFall = async () => {
    if (!user || !hairFallCount) return;
    const { error } = await supabase.from("hair_fall_logs").insert({ user_id: user.id, count: parseInt(hairFallCount) });
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Logged!", description: `${hairFallCount} strands recorded.` });
    setHairFallCount("");
    setHairFallOpen(false);
    const { data } = await supabase.from("hair_fall_logs").select("count, logged_at").eq("user_id", user.id).order("logged_at");
    if (data) setHairLogs(data);
  };

  const submitSymptoms = async () => {
    if (!user || selectedSymptoms.length === 0) return;
    const { error } = await supabase.from("symptom_logs").insert({
      user_id: user.id, symptoms: selectedSymptoms, severity: parseInt(severity), notes: symptomNotes || null,
    });
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Symptoms logged!" });
    setSelectedSymptoms([]);
    setSeverity("3");
    setSymptomNotes("");
    setSymptomOpen(false);
    const { data } = await supabase.from("symptom_logs").select("symptoms, severity, logged_at").eq("user_id", user.id).order("logged_at");
    if (data) setSymptomLogs(data);
  };

  const uploadPhoto = async (file: File) => {
    if (!user) return;
    setUploading(true);
    const path = `${user.id}/progress-${Date.now()}.${file.name.split(".").pop()}`;
    const { error: upErr } = await supabase.storage.from("scalp-photos").upload(path, file);
    if (upErr) { toast({ title: "Upload failed", description: upErr.message, variant: "destructive" }); setUploading(false); return; }
    const { data: urlData } = supabase.storage.from("scalp-photos").getPublicUrl(path);
    const { error } = await supabase.from("scalp_progress_photos").insert({
      user_id: user.id, photo_url: urlData.publicUrl, week_number: parseInt(photoWeek), photo_type: "top",
    });
    setUploading(false);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Photo uploaded!" });
    setPhotoOpen(false);
    const { data } = await supabase.from("scalp_progress_photos").select("photo_url, week_number, uploaded_at, photo_type").eq("user_id", user.id).order("uploaded_at");
    if (data) setPhotos(data);
  };

  const handleSlider = (e: React.MouseEvent | React.TouchEvent) => {
    if (!sliderContainerRef.current) return;
    const rect = sliderContainerRef.current.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const pos = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    setSliderPos(pos);
  };

  if (authLoading) return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground font-body">Loading…</p></div>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 container mx-auto px-4 max-w-5xl space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild><Link to="/dashboard"><ArrowLeft className="h-5 w-5" /></Link></Button>
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">Progress Tracking</h1>
            <p className="text-muted-foreground font-body mt-1">Monitor your scalp health recovery over time.</p>
          </div>
        </div>

        {/* Log buttons */}
        <div className="flex flex-wrap gap-3">
          <Dialog open={hairFallOpen} onOpenChange={setHairFallOpen}>
            <DialogTrigger asChild>
              <Button variant="hero" size="lg"><TrendingDown className="mr-2 h-4 w-4" /> Log Hair Fall</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle className="font-display">Log Hair Fall Count</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label>Strands lost today</Label>
                  <Input type="number" min={0} value={hairFallCount} onChange={(e) => setHairFallCount(e.target.value)} placeholder="e.g. 75" />
                </div>
                <Button variant="hero" className="w-full" onClick={submitHairFall} disabled={!hairFallCount}>Save</Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={symptomOpen} onOpenChange={setSymptomOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="lg"><Activity className="mr-2 h-4 w-4" /> Log Symptoms</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader><DialogTitle className="font-display">Log Scalp Symptoms</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label>Select symptoms</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {SYMPTOM_OPTIONS.map((s) => (
                      <label key={s} className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                          checked={selectedSymptoms.includes(s)}
                          onCheckedChange={(checked) =>
                            setSelectedSymptoms((prev) => checked ? [...prev, s] : prev.filter((x) => x !== s))
                          }
                        />
                        <span className="text-sm font-body">{s}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Overall severity (1-5)</Label>
                  <Select value={severity} onValueChange={setSeverity}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((v) => (
                        <SelectItem key={v} value={String(v)}>{v} — {["Mild", "Low", "Moderate", "High", "Severe"][v - 1]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Notes (optional)</Label>
                  <Textarea value={symptomNotes} onChange={(e) => setSymptomNotes(e.target.value)} placeholder="Any additional observations…" />
                </div>
                <Button variant="hero" className="w-full" onClick={submitSymptoms} disabled={selectedSymptoms.length === 0}>Save</Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={photoOpen} onOpenChange={setPhotoOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="lg"><Camera className="mr-2 h-4 w-4" /> Upload Scalp Photo</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle className="font-display">Upload Weekly Scalp Photo</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label>Recovery week</Label>
                  <Select value={photoWeek} onValueChange={setPhotoWeek}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6].map((w) => (
                        <SelectItem key={w} value={String(w)}>Week {w}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Photo</Label>
                  <Input ref={fileRef} type="file" accept="image/*" />
                </div>
                <Button
                  variant="hero"
                  className="w-full"
                  disabled={uploading}
                  onClick={() => {
                    const file = fileRef.current?.files?.[0];
                    if (file) uploadPhoto(file);
                  }}
                >
                  {uploading ? "Uploading…" : "Upload"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Charts */}
        <Tabs defaultValue="hairfall" className="space-y-4">
          <TabsList>
            <TabsTrigger value="hairfall">Hair Fall Trend</TabsTrigger>
            <TabsTrigger value="symptoms">Symptom Improvement</TabsTrigger>
          </TabsList>

          <TabsContent value="hairfall">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="font-display text-lg">Hair Fall Trend</CardTitle>
                <CardDescription className="font-body">Daily hair strand count over time</CardDescription>
              </CardHeader>
              <CardContent>
                {hairChartData.length === 0 ? (
                  <p className="text-muted-foreground font-body text-sm py-8 text-center">No hair fall data yet. Log your first count above!</p>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={hairChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "var(--radius)" }} />
                      <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))", r: 4 }} name="Strands" />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="symptoms">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="font-display text-lg">Symptom Improvement</CardTitle>
                <CardDescription className="font-body">Severity score & symptom count over time</CardDescription>
              </CardHeader>
              <CardContent>
                {symptomChartData.length === 0 ? (
                  <p className="text-muted-foreground font-body text-sm py-8 text-center">No symptom data yet. Log your symptoms above!</p>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={symptomChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "var(--radius)" }} />
                      <Bar dataKey="severity" fill="hsl(var(--primary))" name="Severity" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="count" fill="hsl(var(--accent-foreground))" name="Symptom Count" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Before/After Photo Comparison */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-display text-lg">Before & After Comparison</CardTitle>
            <CardDescription className="font-body">Drag the slider to compare your progress photos</CardDescription>
          </CardHeader>
          <CardContent>
            {!beforePhoto || !afterPhoto ? (
              <p className="text-muted-foreground font-body text-sm py-8 text-center">
                Upload at least 2 scalp photos from different weeks to see a comparison.
              </p>
            ) : (
              <div
                ref={sliderContainerRef}
                className="relative w-full aspect-[4/3] rounded-lg overflow-hidden cursor-col-resize select-none"
                onMouseMove={(e) => { if (e.buttons === 1) handleSlider(e); }}
                onMouseDown={handleSlider}
                onTouchMove={handleSlider}
                onTouchStart={handleSlider}
              >
                {/* After (full background) */}
                <img src={afterPhoto.photo_url} alt="After" className="absolute inset-0 w-full h-full object-cover" />
                {/* Before (clipped) */}
                <div className="absolute inset-0 overflow-hidden" style={{ width: `${sliderPos}%` }}>
                  <img src={beforePhoto.photo_url} alt="Before" className="absolute inset-0 w-full h-full object-cover" style={{ minWidth: sliderContainerRef.current ? `${sliderContainerRef.current.offsetWidth}px` : "100%" }} />
                </div>
                {/* Slider line */}
                <div className="absolute top-0 bottom-0 w-0.5 bg-primary-foreground/80 shadow-lg" style={{ left: `${sliderPos}%` }}>
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-primary-foreground/90 border-2 border-primary flex items-center justify-center shadow-elevated">
                    <span className="text-xs font-bold text-primary">↔</span>
                  </div>
                </div>
                {/* Labels */}
                <span className="absolute top-3 left-3 bg-foreground/70 text-primary-foreground text-xs font-body px-2 py-1 rounded">Week {beforePhoto.week_number}</span>
                <span className="absolute top-3 right-3 bg-foreground/70 text-primary-foreground text-xs font-body px-2 py-1 rounded">Week {afterPhoto.week_number}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Photo gallery */}
        {photos.length > 0 && (
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="font-display text-lg">All Progress Photos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {photos.map((p) => (
                  <div key={p.uploaded_at} className="relative rounded-lg overflow-hidden aspect-square">
                    <img src={p.photo_url} alt={`Week ${p.week_number}`} className="w-full h-full object-cover" />
                    <span className="absolute bottom-2 left-2 bg-foreground/70 text-primary-foreground text-xs font-body px-2 py-0.5 rounded">
                      Wk {p.week_number}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Progress;
