import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuizConfig, QuizStep, QuizField, PhotoField } from "@/hooks/useQuizConfig";
import { Upload, Camera, ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const QuizFlow = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: config, isLoading, error } = useQuizConfig();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [photos, setPhotos] = useState<Record<string, File | null>>({});

  if (isLoading) {
    return (
      <div className="max-w-lg mx-auto space-y-6">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-full" />
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}
      </div>
    );
  }

  if (error || !config) {
    return (
      <div className="max-w-lg mx-auto text-center py-12 space-y-4">
        <p className="text-destructive font-medium">Failed to load quiz configuration.</p>
        <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  const steps = config.steps;
  const totalSteps = steps.length;
  const currentStep = steps[step];
  const progress = ((step + 1) / totalSteps) * 100;

  const setAnswer = (key: string, value: any) => setAnswers(prev => ({ ...prev, [key]: value }));

  const toggleArrayItem = (key: string, item: string) => {
    const arr: string[] = answers[key] || [];
    setAnswer(key, arr.includes(item) ? arr.filter(i => i !== item) : [...arr, item]);
  };

  const canProceed = (): boolean => {
    if (!currentStep) return false;
    if (!currentStep.required) return true;

    if (currentStep.type === "radio") {
      return !!answers[currentStep.key];
    }
    if (currentStep.type === "text_input") {
      return !!answers[currentStep.key]?.trim();
    }
    if (currentStep.type === "lifestyle_group" && currentStep.fields) {
      return (currentStep.fields as QuizField[])
        .filter(f => f.required)
        .every(f => {
          const v = answers[f.key];
          return v !== undefined && v !== "" && v !== null;
        });
    }
    return true;
  };

  const uploadPhoto = async (file: File, path: string) => {
    const { data, error } = await supabase.storage
      .from("scalp-photos")
      .upload(path, file, { upsert: true });
    if (error) throw error;
    return data.path;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const sessionId = crypto.randomUUID();
      const insertData: Record<string, any> = { session_id: sessionId };

      // Map answers to DB columns
      for (const s of steps) {
        if (s.type === "radio" || s.type === "checkbox") {
          if (s.db_column && answers[s.key] !== undefined) {
            insertData[s.db_column] = answers[s.key] || (s.type === "checkbox" ? [] : null);
          }
        } else if (s.type === "text_input") {
          if (s.db_column && answers[s.key]) {
            insertData[s.db_column] = answers[s.key];
          }
        } else if (s.type === "lifestyle_group" && s.fields) {
          for (const f of s.fields as QuizField[]) {
            if (f.db_column && answers[f.key] !== undefined) {
              insertData[f.db_column] = answers[f.key] || null;
            }
          }
        } else if (s.type === "photo_upload" && s.fields) {
          for (const f of s.fields as PhotoField[]) {
            const file = photos[f.key];
            if (file && f.db_column) {
              insertData[f.db_column] = await uploadPhoto(file, `${sessionId}/${f.key}.jpg`);
            }
          }
        }
      }

      // Ensure required DB fields have defaults
      if (!insertData.symptoms) insertData.symptoms = [];
      if (!insertData.hair_changes) insertData.hair_changes = [];

      const { error } = await supabase.from("scalp_assessments").insert(insertData as any);
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

  const FileUploadBox = ({ label, file, onSelect }: { label: string; file: File | null; onSelect: (f: File) => void }) => (
    <label className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/40 p-6 cursor-pointer hover:border-primary/60 transition-colors">
      {file ? (
        <span className="text-sm font-medium text-foreground">{file.name}</span>
      ) : (
        <>
          <Camera className="h-6 w-6 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{label}</span>
        </>
      )}
      <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && onSelect(e.target.files[0])} />
    </label>
  );

  const variants = { enter: { opacity: 0, x: 40 }, center: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -40 } };

  const StepHeader = ({ s: step }: { s: QuizStep }) => (
    <div>
      <h2 className="font-display text-2xl font-bold text-foreground">{step.title}</h2>
      <p className="text-muted-foreground mt-1">{step.subtitle}</p>
      {step.description && <p className="text-sm text-muted-foreground mt-2">{step.description}</p>}
    </div>
  );

  const renderStep = (s: QuizStep) => {
    switch (s.type) {
      case "radio":
        return (
          <motion.div key={s.key} variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="space-y-6">
            <StepHeader s={s} />
            <RadioGroup value={answers[s.key] || ""} onValueChange={v => setAnswer(s.key, v)}>
              {s.options?.map(opt => (
                <label key={opt.value} className={`flex items-center gap-3 rounded-xl border-2 p-4 cursor-pointer transition-all ${answers[s.key] === opt.value ? "border-primary bg-accent" : "border-border hover:border-primary/40"}`}>
                  <RadioGroupItem value={opt.value} id={opt.value} />
                  <Label htmlFor={opt.value} className="cursor-pointer text-base font-medium">{opt.label}</Label>
                </label>
              ))}
            </RadioGroup>
          </motion.div>
        );

      case "checkbox":
        return (
          <motion.div key={s.key} variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="space-y-6">
            <StepHeader s={s} />
            <div className="space-y-3">
              {s.options?.map(opt => {
                const checked = (answers[s.key] || []).includes(opt.value);
                return (
                  <label key={opt.value} className={`flex items-center gap-3 rounded-xl border-2 p-4 cursor-pointer transition-all ${checked ? "border-primary bg-accent" : "border-border hover:border-primary/40"}`}>
                    <Checkbox checked={checked} onCheckedChange={() => toggleArrayItem(s.key, opt.value)} />
                    <span className="text-base font-medium text-foreground">{opt.label}</span>
                  </label>
                );
              })}
            </div>
          </motion.div>
        );

      case "lifestyle_group":
        return (
          <motion.div key={s.key} variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="space-y-6">
            <StepHeader s={s} />
            <div className="space-y-5">
              {(s.fields as QuizField[])?.map(field => (
                <div key={field.key} className="space-y-2">
                  <Label className="text-sm font-medium">{field.label} {field.required && "*"}</Label>
                  {field.type === "select" && field.options ? (
                    <Select value={answers[field.key] || ""} onValueChange={v => setAnswer(field.key, v)}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {field.options.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : field.type === "number" ? (
                    <Input
                      type="number"
                      min={field.min}
                      max={field.max}
                      value={answers[field.key] ?? 7}
                      onChange={e => setAnswer(field.key, Number(e.target.value))}
                    />
                  ) : null}
                </div>
              ))}
            </div>
          </motion.div>
        );

      case "photo_upload":
        return (
          <motion.div key={s.key} variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="space-y-6">
            <StepHeader s={s} />
            <div className="grid gap-4">
              {(s.fields as PhotoField[])?.map(f => (
                <FileUploadBox key={f.key} label={f.label} file={photos[f.key] || null} onSelect={file => setPhotos(prev => ({ ...prev, [f.key]: file }))} />
              ))}
            </div>
          </motion.div>
        );

      case "text_input":
        return (
          <motion.div key={s.key} variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="space-y-6">
            <StepHeader s={s} />
            <Textarea
              value={answers[s.key] || ""}
              onChange={e => setAnswer(s.key, e.target.value)}
              placeholder={s.placeholder || "Describe in detail..."}
              rows={5}
              className="text-base"
            />
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-8">
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Step {step + 1} of {totalSteps}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <AnimatePresence mode="wait">
        {currentStep && renderStep(currentStep)}
      </AnimatePresence>

      <div className="flex justify-between pt-4">
        <Button variant="heroOutline" onClick={() => setStep(s => s - 1)} disabled={step === 0}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>

        {step < totalSteps - 1 ? (
          <Button variant="hero" onClick={() => setStep(s => s + 1)} disabled={!canProceed()}>
            Next <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        ) : (
          <Button variant="hero" onClick={handleSubmit} disabled={submitting || !canProceed()}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Upload className="h-4 w-4 mr-1" />}
            {submitting ? "Submitting…" : "Get My Report"}
          </Button>
        )}
      </div>
    </div>
  );
};

export default QuizFlow;
