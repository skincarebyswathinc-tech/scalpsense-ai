import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Upload, Camera, ArrowRight, ArrowLeft, Loader2 } from "lucide-react";

const TOTAL_STEPS = 6;

const SYMPTOMS = [
  "White flakes",
  "Yellow flakes",
  "Itch",
  "Redness",
  "Scalp pimples",
  "Burning sensation",
];

const HAIR_CHANGES = [
  "Thinning hairline",
  "Widening part line",
  "Reduced ponytail thickness",
  "Sudden hair fall",
];

type SheddingLevel = "less_than_50" | "50_100" | "100_150" | "150_plus";
type ScalpFeel = "dry" | "balanced" | "slightly_oily" | "very_oily";
type StressLevel = "low" | "medium" | "high";

interface QuizData {
  hairShedding: SheddingLevel | "";
  scalpFeel: ScalpFeel | "";
  symptoms: string[];
  hairChanges: string[];
  stressLevel: StressLevel | "";
  sleepHours: number;
  proteinIntake: string;
  hairStylingFrequency: string;
  hairColoringTreatments: string;
  photoFrontScalp: File | null;
  photoTopScalp: File | null;
  photoCrown: File | null;
}

const QuizFlow = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [data, setData] = useState<QuizData>({
    hairShedding: "",
    scalpFeel: "",
    symptoms: [],
    hairChanges: [],
    stressLevel: "",
    sleepHours: 7,
    proteinIntake: "",
    hairStylingFrequency: "",
    hairColoringTreatments: "",
    photoFrontScalp: null,
    photoTopScalp: null,
    photoCrown: null,
  });

  const progress = (step / TOTAL_STEPS) * 100;

  const canProceed = useCallback(() => {
    switch (step) {
      case 1: return data.hairShedding !== "";
      case 2: return data.scalpFeel !== "";
      case 3: return true; // optional
      case 4: return true; // optional
      case 5: return data.stressLevel !== "" && data.sleepHours > 0;
      case 6: return true; // photos optional
      default: return false;
    }
  }, [step, data]);

  const toggleArrayItem = (arr: string[], item: string) =>
    arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item];

  const uploadPhoto = async (file: File, path: string) => {
    const { data: uploadData, error } = await supabase.storage
      .from("scalp-photos")
      .upload(path, file, { upsert: true });
    if (error) throw error;
    return uploadData.path;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const sessionId = crypto.randomUUID();
      let photoFrontScalp: string | null = null;
      let photoTopScalp: string | null = null;
      let photoCrown: string | null = null;

      if (data.photoFrontScalp) {
        photoFrontScalp = await uploadPhoto(data.photoFrontScalp, `${sessionId}/front.jpg`);
      }
      if (data.photoTopScalp) {
        photoTopScalp = await uploadPhoto(data.photoTopScalp, `${sessionId}/top.jpg`);
      }
      if (data.photoCrown) {
        photoCrown = await uploadPhoto(data.photoCrown, `${sessionId}/crown.jpg`);
      }

      const { error } = await supabase.from("scalp_assessments").insert({
        session_id: sessionId,
        hair_shedding: data.hairShedding as SheddingLevel,
        scalp_feel: data.scalpFeel as ScalpFeel,
        stress_level: data.stressLevel as StressLevel,
        sleep_hours: data.sleepHours,
        symptoms: data.symptoms,
        hair_changes: data.hairChanges,
        protein_intake: data.proteinIntake || null,
        hair_styling_frequency: data.hairStylingFrequency || null,
        hair_coloring_treatments: data.hairColoringTreatments || null,
        photo_front_scalp: photoFrontScalp,
        photo_top_scalp: photoTopScalp,
        photo_crown: photoCrown,
      });

      if (error) throw error;

      localStorage.setItem("scalp_session_id", sessionId);
      toast({ title: "Assessment complete!", description: "Generating your scalp health report…" });
      navigate("/report");
    } catch (err: any) {
      toast({ title: "Submission failed", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const FileUploadBox = ({
    label,
    file,
    onSelect,
  }: {
    label: string;
    file: File | null;
    onSelect: (f: File) => void;
  }) => (
    <label className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/40 p-6 cursor-pointer hover:border-primary/60 transition-colors">
      {file ? (
        <span className="text-sm font-medium text-foreground">{file.name}</span>
      ) : (
        <>
          <Camera className="h-6 w-6 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{label}</span>
        </>
      )}
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && onSelect(e.target.files[0])}
      />
    </label>
  );

  const stepContent = () => {
    const variants = {
      enter: { opacity: 0, x: 40 },
      center: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -40 },
    };

    switch (step) {
      case 1:
        return (
          <motion.div key="step1" variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="space-y-6">
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground">Hair Shedding</h2>
              <p className="text-muted-foreground mt-1">How many hairs do you shed per day on average?</p>
            </div>
            <RadioGroup value={data.hairShedding} onValueChange={(v) => setData({ ...data, hairShedding: v as SheddingLevel })}>
              {([["less_than_50", "Less than 50"], ["50_100", "50–100"], ["100_150", "100–150"], ["150_plus", "150+"]] as const).map(([val, label]) => (
                <label key={val} className={`flex items-center gap-3 rounded-xl border-2 p-4 cursor-pointer transition-all ${data.hairShedding === val ? "border-primary bg-accent" : "border-border hover:border-primary/40"}`}>
                  <RadioGroupItem value={val} id={val} />
                  <Label htmlFor={val} className="cursor-pointer text-base font-medium">{label}</Label>
                </label>
              ))}
            </RadioGroup>
          </motion.div>
        );
      case 2:
        return (
          <motion.div key="step2" variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="space-y-6">
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground">Scalp Feel</h2>
              <p className="text-muted-foreground mt-1">How does your scalp feel 24 hours after washing?</p>
            </div>
            <RadioGroup value={data.scalpFeel} onValueChange={(v) => setData({ ...data, scalpFeel: v as ScalpFeel })}>
              {([["dry", "Dry"], ["balanced", "Balanced"], ["slightly_oily", "Slightly Oily"], ["very_oily", "Very Oily"]] as const).map(([val, label]) => (
                <label key={val} className={`flex items-center gap-3 rounded-xl border-2 p-4 cursor-pointer transition-all ${data.scalpFeel === val ? "border-primary bg-accent" : "border-border hover:border-primary/40"}`}>
                  <RadioGroupItem value={val} id={val} />
                  <Label htmlFor={val} className="cursor-pointer text-base font-medium">{label}</Label>
                </label>
              ))}
            </RadioGroup>
          </motion.div>
        );
      case 3:
        return (
          <motion.div key="step3" variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="space-y-6">
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground">Symptoms</h2>
              <p className="text-muted-foreground mt-1">Select all that apply (optional)</p>
            </div>
            <div className="space-y-3">
              {SYMPTOMS.map((symptom) => (
                <label key={symptom} className={`flex items-center gap-3 rounded-xl border-2 p-4 cursor-pointer transition-all ${data.symptoms.includes(symptom) ? "border-primary bg-accent" : "border-border hover:border-primary/40"}`}>
                  <Checkbox
                    checked={data.symptoms.includes(symptom)}
                    onCheckedChange={() => setData({ ...data, symptoms: toggleArrayItem(data.symptoms, symptom) })}
                  />
                  <span className="text-base font-medium text-foreground">{symptom}</span>
                </label>
              ))}
            </div>
          </motion.div>
        );
      case 4:
        return (
          <motion.div key="step4" variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="space-y-6">
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground">Hair Changes</h2>
              <p className="text-muted-foreground mt-1">Select all that apply (optional)</p>
            </div>
            <div className="space-y-3">
              {HAIR_CHANGES.map((change) => (
                <label key={change} className={`flex items-center gap-3 rounded-xl border-2 p-4 cursor-pointer transition-all ${data.hairChanges.includes(change) ? "border-primary bg-accent" : "border-border hover:border-primary/40"}`}>
                  <Checkbox
                    checked={data.hairChanges.includes(change)}
                    onCheckedChange={() => setData({ ...data, hairChanges: toggleArrayItem(data.hairChanges, change) })}
                  />
                  <span className="text-base font-medium text-foreground">{change}</span>
                </label>
              ))}
            </div>
          </motion.div>
        );
      case 5:
        return (
          <motion.div key="step5" variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="space-y-6">
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground">Lifestyle</h2>
              <p className="text-muted-foreground mt-1">Tell us about your daily habits</p>
            </div>
            <div className="space-y-5">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Stress Level *</Label>
                <Select value={data.stressLevel} onValueChange={(v) => setData({ ...data, stressLevel: v as StressLevel })}>
                  <SelectTrigger><SelectValue placeholder="Select stress level" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Sleep Hours per Night *</Label>
                <Input
                  type="number"
                  min={1}
                  max={16}
                  value={data.sleepHours}
                  onChange={(e) => setData({ ...data, sleepHours: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Protein Intake</Label>
                <Select value={data.proteinIntake} onValueChange={(v) => setData({ ...data, proteinIntake: v })}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Hair Styling Frequency</Label>
                <Select value={data.hairStylingFrequency} onValueChange={(v) => setData({ ...data, hairStylingFrequency: v })}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rarely">Rarely</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Hair Coloring / Treatments</Label>
                <Select value={data.hairColoringTreatments} onValueChange={(v) => setData({ ...data, hairColoringTreatments: v })}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="never">Never</SelectItem>
                    <SelectItem value="occasionally">Occasionally</SelectItem>
                    <SelectItem value="frequently">Frequently</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </motion.div>
        );
      case 6:
        return (
          <motion.div key="step6" variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="space-y-6">
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground">Photo Upload</h2>
              <p className="text-muted-foreground mt-1">Optional — helps us give a more accurate assessment</p>
            </div>
            <div className="grid gap-4">
              <FileUploadBox label="Front Scalp" file={data.photoFrontScalp} onSelect={(f) => setData({ ...data, photoFrontScalp: f })} />
              <FileUploadBox label="Top Scalp" file={data.photoTopScalp} onSelect={(f) => setData({ ...data, photoTopScalp: f })} />
              <FileUploadBox label="Crown" file={data.photoCrown} onSelect={(f) => setData({ ...data, photoCrown: f })} />
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-8">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Step {step} of {TOTAL_STEPS}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        {stepContent()}
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button
          variant="heroOutline"
          onClick={() => setStep((s) => s - 1)}
          disabled={step === 1}
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>

        {step < TOTAL_STEPS ? (
          <Button
            variant="hero"
            onClick={() => setStep((s) => s + 1)}
            disabled={!canProceed()}
          >
            Next <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        ) : (
          <Button
            variant="hero"
            onClick={handleSubmit}
            disabled={submitting || !canProceed()}
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Upload className="h-4 w-4 mr-1" />}
            {submitting ? "Submitting…" : "Get My Report"}
          </Button>
        )}
      </div>
    </div>
  );
};

export default QuizFlow;
