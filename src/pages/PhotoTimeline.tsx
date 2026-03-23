import { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import PremiumGate from "@/components/PremiumGate";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Navbar from "@/components/landing/Navbar";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Camera, Upload } from "lucide-react";
import { motion } from "framer-motion";

const PHOTO_TYPES = [
  { value: "front", label: "Front Hairline" },
  { value: "top", label: "Top Scalp" },
  { value: "crown", label: "Crown" },
];

interface Photo {
  id: string;
  photo_url: string;
  week_number: number;
  photo_type: string;
  notes: string | null;
  hair_fall_level: string | null;
  scalp_score: number | null;
  uploaded_at: string;
}

const PhotoTimeline = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [photoType, setPhotoType] = useState("front");
  const [photoWeek, setPhotoWeek] = useState("1");
  const [hairFallLevel, setHairFallLevel] = useState("");
  const [photoNotes, setPhotoNotes] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // Compare state
  const [compareFrom, setCompareFrom] = useState("");
  const [compareTo, setCompareTo] = useState("");
  const [compareType, setCompareType] = useState("front");
  const [sliderPos, setSliderPos] = useState(50);
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [authLoading, user, navigate]);

  const loadPhotos = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("scalp_progress_photos" as any)
      .select("id, photo_url, week_number, photo_type, notes, hair_fall_level, scalp_score, uploaded_at")
      .eq("user_id", user.id)
      .order("week_number")
      .order("photo_type");
    if (data) setPhotos(data as any as Photo[]);
  };

  useEffect(() => { loadPhotos(); }, [user]);

  const uploadPhoto = async () => {
    if (!user) return;
    const file = fileRef.current?.files?.[0];
    if (!file) { toast({ title: "No file selected", variant: "destructive" }); return; }

    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/timeline-${photoType}-wk${photoWeek}-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("scalp-photos").upload(path, file);
    if (upErr) { toast({ title: "Upload failed", description: upErr.message, variant: "destructive" }); setUploading(false); return; }

    const { data: urlData } = supabase.storage.from("scalp-photos").getPublicUrl(path);

    // Get current score
    const { data: scoreData } = await supabase
      .from("scalp_recovery_scores" as any)
      .select("score")
      .eq("user_id", user.id)
      .order("week_number", { ascending: false })
      .limit(1)
      .single();

    const { error } = await supabase.from("scalp_progress_photos" as any).insert({
      user_id: user.id,
      photo_url: urlData.publicUrl,
      week_number: parseInt(photoWeek),
      photo_type: photoType,
      notes: photoNotes || null,
      hair_fall_level: hairFallLevel || null,
      scalp_score: (scoreData as any)?.score ?? null,
    } as any);

    setUploading(false);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Photo uploaded!" });
    setUploadOpen(false);
    setPhotoNotes("");
    setHairFallLevel("");
    await loadPhotos();
  };

  // Group photos by week
  const weekNumbers = [...new Set(photos.map((p) => p.week_number))].sort((a, b) => a - b);

  // Photos for comparison
  const fromPhoto = photos.find((p) => p.week_number === parseInt(compareFrom) && p.photo_type === compareType);
  const toPhoto = photos.find((p) => p.week_number === parseInt(compareTo) && p.photo_type === compareType);

  const handleSlider = (e: React.MouseEvent | React.TouchEvent) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    setSliderPos(Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100)));
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
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">Photo Timeline</h1>
            <p className="text-muted-foreground font-body mt-1">Track your scalp recovery visually week by week.</p>
          </div>
        </div>

        {/* Upload Button */}
        <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
          <DialogTrigger asChild>
            <Button variant="hero" size="lg"><Camera className="mr-2 h-4 w-4" /> Upload Scalp Photo</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle className="font-display">Upload Weekly Photo</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Photo Type</Label>
                  <Select value={photoType} onValueChange={setPhotoType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PHOTO_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Week Number</Label>
                  <Select value={photoWeek} onValueChange={setPhotoWeek}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((w) => (
                        <SelectItem key={w} value={String(w)}>Week {w}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Hair Fall Level</Label>
                <Select value={hairFallLevel} onValueChange={setHairFallLevel}>
                  <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minimal">Minimal (&lt;50 strands)</SelectItem>
                    <SelectItem value="moderate">Moderate (50-100)</SelectItem>
                    <SelectItem value="high">High (100-150)</SelectItem>
                    <SelectItem value="severe">Severe (150+)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Notes (optional)</Label>
                <Input value={photoNotes} onChange={(e) => setPhotoNotes(e.target.value)} placeholder="Any observations…" />
              </div>
              <div className="space-y-2">
                <Label>Photo</Label>
                <Input ref={fileRef} type="file" accept="image/*" />
              </div>
              <Button variant="hero" className="w-full" onClick={uploadPhoto} disabled={uploading}>
                {uploading ? "Uploading…" : <><Upload className="mr-2 h-4 w-4" /> Upload</>}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Tabs defaultValue="timeline" className="space-y-6">
          <TabsList>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="compare">Before / After</TabsTrigger>
          </TabsList>

          {/* TIMELINE TAB */}
          <TabsContent value="timeline">
            {weekNumbers.length === 0 ? (
              <Card className="shadow-card"><CardContent className="py-12 text-center">
                <Camera className="mx-auto h-12 w-12 text-muted-foreground/40 mb-4" />
                <p className="text-muted-foreground font-body">No photos uploaded yet. Start documenting your recovery!</p>
              </CardContent></Card>
            ) : (
              <div className="relative">
                {/* Vertical line */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border hidden md:block" />

                <div className="space-y-8">
                  {weekNumbers.map((week, wi) => {
                    const weekPhotos = photos.filter((p) => p.week_number === week);
                    const firstPhoto = weekPhotos[0];
                    return (
                      <motion.div
                        key={week}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: wi * 0.1 }}
                        className="relative md:pl-16"
                      >
                        {/* Timeline dot */}
                        <div className="hidden md:flex absolute left-4 top-6 w-5 h-5 rounded-full bg-primary border-4 border-background shadow-soft" />

                        <Card className="shadow-card">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <CardTitle className="font-display text-lg">Week {week}</CardTitle>
                              <div className="flex gap-2">
                                {firstPhoto?.scalp_score != null && (
                                  <span className="text-xs font-body bg-primary/10 text-primary px-2 py-1 rounded-full">
                                    Score: {firstPhoto.scalp_score}/100
                                  </span>
                                )}
                                {firstPhoto?.hair_fall_level && (
                                  <span className="text-xs font-body bg-muted text-muted-foreground px-2 py-1 rounded-full capitalize">
                                    {firstPhoto.hair_fall_level} shedding
                                  </span>
                                )}
                              </div>
                            </div>
                            <CardDescription className="font-body text-xs">
                              {new Date(firstPhoto.uploaded_at).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-3 gap-3">
                              {PHOTO_TYPES.map((type) => {
                                const photo = weekPhotos.find((p) => p.photo_type === type.value);
                                return (
                                  <div key={type.value} className="space-y-1.5">
                                    <p className="text-xs font-body text-muted-foreground text-center">{type.label}</p>
                                    {photo ? (
                                      <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                                        <img src={photo.photo_url} alt={`${type.label} — Week ${week}`} className="w-full h-full object-cover" loading="lazy" />
                                      </div>
                                    ) : (
                                      <div className="aspect-square rounded-lg bg-muted/50 flex items-center justify-center">
                                        <Camera className="h-6 w-6 text-muted-foreground/30" />
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                            {firstPhoto?.notes && (
                              <p className="text-xs text-muted-foreground font-body mt-3 italic">"{firstPhoto.notes}"</p>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}
          </TabsContent>

          {/* COMPARE TAB */}
          <TabsContent value="compare">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="font-display text-lg">Before & After Comparison</CardTitle>
                <CardDescription className="font-body">Select two weeks and a photo type to compare side by side.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs">Before (Week)</Label>
                    <Select value={compareFrom} onValueChange={setCompareFrom}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {weekNumbers.map((w) => <SelectItem key={w} value={String(w)}>Week {w}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">After (Week)</Label>
                    <Select value={compareTo} onValueChange={setCompareTo}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {weekNumbers.map((w) => <SelectItem key={w} value={String(w)}>Week {w}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Photo Type</Label>
                    <Select value={compareType} onValueChange={setCompareType}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {PHOTO_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {fromPhoto && toPhoto ? (
                  <div className="space-y-3">
                    {/* Slider */}
                    <div
                      ref={sliderRef}
                      className="relative w-full aspect-[4/3] rounded-lg overflow-hidden cursor-col-resize select-none"
                      onMouseMove={(e) => { if (e.buttons === 1) handleSlider(e); }}
                      onMouseDown={handleSlider}
                      onTouchMove={handleSlider}
                      onTouchStart={handleSlider}
                    >
                      {/* After (background) */}
                      <img src={toPhoto.photo_url} alt="After" className="absolute inset-0 w-full h-full object-cover" />
                      {/* Before (clipped) */}
                      <div className="absolute inset-0 overflow-hidden" style={{ width: `${sliderPos}%` }}>
                        <img
                          src={fromPhoto.photo_url}
                          alt="Before"
                          className="absolute inset-0 w-full h-full object-cover"
                          style={{ minWidth: sliderRef.current ? `${sliderRef.current.offsetWidth}px` : "100%" }}
                        />
                      </div>
                      {/* Slider handle */}
                      <div className="absolute top-0 bottom-0 w-0.5 bg-primary-foreground/80" style={{ left: `${sliderPos}%` }}>
                        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-primary-foreground/90 border-2 border-primary flex items-center justify-center shadow-elevated">
                          <span className="text-sm font-bold text-primary">↔</span>
                        </div>
                      </div>
                      {/* Labels */}
                      <div className="absolute bottom-3 left-3 bg-foreground/70 text-primary-foreground text-xs font-body px-2.5 py-1 rounded-lg">
                        <div>Week {fromPhoto.week_number}</div>
                        {fromPhoto.scalp_score != null && <div className="text-[10px] opacity-80">Score: {fromPhoto.scalp_score}</div>}
                        {fromPhoto.hair_fall_level && <div className="text-[10px] opacity-80 capitalize">{fromPhoto.hair_fall_level}</div>}
                      </div>
                      <div className="absolute bottom-3 right-3 bg-foreground/70 text-primary-foreground text-xs font-body px-2.5 py-1 rounded-lg text-right">
                        <div>Week {toPhoto.week_number}</div>
                        {toPhoto.scalp_score != null && <div className="text-[10px] opacity-80">Score: {toPhoto.scalp_score}</div>}
                        {toPhoto.hair_fall_level && <div className="text-[10px] opacity-80 capitalize">{toPhoto.hair_fall_level}</div>}
                      </div>
                    </div>

                    {/* Score comparison */}
                    {fromPhoto.scalp_score != null && toPhoto.scalp_score != null && (
                      <div className="flex items-center justify-center gap-6 py-2">
                        <div className="text-center">
                          <p className="text-2xl font-display font-bold text-muted-foreground">{fromPhoto.scalp_score}</p>
                          <p className="text-xs font-body text-muted-foreground">Week {fromPhoto.week_number}</p>
                        </div>
                        <div className="text-2xl font-display text-primary">→</div>
                        <div className="text-center">
                          <p className="text-2xl font-display font-bold text-primary">{toPhoto.scalp_score}</p>
                          <p className="text-xs font-body text-muted-foreground">Week {toPhoto.week_number}</p>
                        </div>
                        {toPhoto.scalp_score > fromPhoto.scalp_score && (
                          <span className="text-sm font-body font-medium text-accent-foreground bg-accent px-3 py-1 rounded-full">
                            +{toPhoto.scalp_score - fromPhoto.scalp_score}% improved
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ) : compareFrom && compareTo ? (
                  <p className="text-muted-foreground font-body text-sm text-center py-8">
                    No matching photos found for the selected weeks and photo type. Upload more photos to compare.
                  </p>
                ) : (
                  <p className="text-muted-foreground font-body text-sm text-center py-8">
                    Select two weeks above to compare your progress photos.
                  </p>
                )}

                {/* Quick compare buttons */}
                {weekNumbers.length >= 2 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    <p className="text-xs font-body text-muted-foreground w-full">Quick compare:</p>
                    {weekNumbers.length >= 4 && (
                      <Button variant="outline" size="sm" onClick={() => { setCompareFrom(String(weekNumbers[0])); setCompareTo(String(weekNumbers[3])); }}>
                        Week {weekNumbers[0]} vs Week {weekNumbers[3]}
                      </Button>
                    )}
                    {weekNumbers.length >= 8 && (
                      <Button variant="outline" size="sm" onClick={() => { setCompareFrom(String(weekNumbers[0])); setCompareTo(String(weekNumbers[7])); }}>
                        Week {weekNumbers[0]} vs Week {weekNumbers[7]}
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={() => { setCompareFrom(String(weekNumbers[0])); setCompareTo(String(weekNumbers[weekNumbers.length - 1])); }}>
                      First vs Latest
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PhotoTimeline;
