import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuizConfig, QuizStep, QuizField, PhotoField, ScoringConfig, IssueRule } from "@/hooks/useQuizConfig";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { FieldHelp } from "@/components/ui/field-help";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/landing/Navbar";
import {
  Settings2, Save, Plus, Trash2, GripVertical, ArrowLeft, ArrowRight,
  AlertTriangle, CheckCircle, Loader2, Eye, Crown, ChevronUp, ChevronDown,
} from "lucide-react";

const AdminScalpQuiz = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { data: config, isLoading, refetch } = useQuizConfig();

  const [steps, setSteps] = useState<QuizStep[]>([]);
  const [scoring, setScoring] = useState<ScoringConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [configId, setConfigId] = useState<string>("");
  const [version, setVersion] = useState(1);
  const stepsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (config) {
      setSteps(JSON.parse(JSON.stringify(config.steps)));
      setScoring(JSON.parse(JSON.stringify(config.scoring)));
      setConfigId(config.id);
      setVersion(config.version);
    }
  }, [config]);

  const handleSave = async () => {
    if (!scoring) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("scalp_quiz_config" as any)
        .update({
          steps: steps as any,
          scoring: scoring as any,
          version: version + 1,
          updated_by: user?.id,
          updated_at: new Date().toISOString(),
        } as any)
        .eq("id", configId);

      if (error) throw error;
      setVersion(v => v + 1);
      await refetch();
      toast({ title: "Quiz config saved!", description: `Version ${version + 1}` });
    } catch (err: any) {
      toast({ title: "Save failed", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const updateStepField = (idx: number, field: string, value: any) => {
    setSteps(prev => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s));
  };

  const addStep = (type: "radio" | "checkbox" | "photo_upload" | "lifestyle_group" | "text_input") => {
    const baseStep: QuizStep = {
      key: `step_${Date.now()}`,
      title: "New Step",
      subtitle: "",
      type,
      required: false,
      description: "",
      weight: 0,
    };
    if (type === "radio" || type === "checkbox") {
      baseStep.db_column = "";
      baseStep.options = [{ value: "", label: "" }];
    } else if (type === "photo_upload") {
      baseStep.fields = [{ key: `photo_${Date.now()}`, label: "Photo", db_column: "" }];
    } else if (type === "lifestyle_group") {
      baseStep.fields = [];
    } else if (type === "text_input") {
      baseStep.db_column = "";
      baseStep.placeholder = "Enter your answer...";
    }
    setSteps(prev => [...prev, baseStep]);
    // Auto-scroll to new step
    setTimeout(() => stepsEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const removeStep = (idx: number) => {
    setSteps(prev => prev.filter((_, i) => i !== idx));
  };

  const moveStep = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= steps.length) return;
    setSteps(prev => {
      const arr = [...prev];
      [arr[idx], arr[target]] = [arr[target], arr[idx]];
      return arr;
    });
  };

  const addOptionToStep = (stepIdx: number) => {
    setSteps(prev => prev.map((s, i) => {
      if (i !== stepIdx || !s.options) return s;
      return { ...s, options: [...s.options, { value: "", label: "" }] };
    }));
  };

  const updateOption = (stepIdx: number, optIdx: number, field: "value" | "label", val: string) => {
    setSteps(prev => prev.map((s, i) => {
      if (i !== stepIdx || !s.options) return s;
      const opts = [...s.options];
      opts[optIdx] = { ...opts[optIdx], [field]: val };
      return { ...s, options: opts };
    }));
  };

  const removeOption = (stepIdx: number, optIdx: number) => {
    setSteps(prev => prev.map((s, i) => {
      if (i !== stepIdx || !s.options) return s;
      return { ...s, options: s.options.filter((_, j) => j !== optIdx) };
    }));
  };

  const updateScoringField = (path: string, value: any) => {
    if (!scoring) return;
    const keys = path.split(".");
    const updated = JSON.parse(JSON.stringify(scoring));
    let obj = updated;
    for (let i = 0; i < keys.length - 1; i++) {
      obj = obj[keys[i]];
    }
    obj[keys[keys.length - 1]] = value;
    setScoring(updated);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-28 pb-20 container mx-auto px-4 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-28 pb-20 container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/admin")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
                <Settings2 className="h-6 w-6 text-primary" />
                Scalp Quiz Configuration
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Version {version} · Manage quiz steps, options, and scoring weights
              </p>
            </div>
          </div>
          <Button variant="hero" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Save Changes
          </Button>
        </div>

        <Tabs defaultValue="steps" className="space-y-6">
          <TabsList>
            <TabsTrigger value="steps">Quiz Steps</TabsTrigger>
            <TabsTrigger value="scoring">Scoring Weights</TabsTrigger>
            <TabsTrigger value="messages">Messages & Rules</TabsTrigger>
          </TabsList>

          {/* ─── Steps Tab ────────────────────── */}
          <TabsContent value="steps" className="space-y-6">
            {/* Add Step Buttons */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-muted-foreground mr-2">Add new step:</span>
                  <Button size="sm" variant="outline" onClick={() => addStep("radio")}>
                    <Plus className="h-3 w-3 mr-1" /> Radio
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => addStep("checkbox")}>
                    <Plus className="h-3 w-3 mr-1" /> Checkbox
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => addStep("text_input")}>
                    <Plus className="h-3 w-3 mr-1" /> Text / Description
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => addStep("photo_upload")}>
                    <Plus className="h-3 w-3 mr-1" /> Photo Upload
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => addStep("lifestyle_group")}>
                    <Plus className="h-3 w-3 mr-1" /> Lifestyle Group
                  </Button>
                </div>
              </CardContent>
            </Card>

            {steps.map((step, idx) => (
              <Card key={idx}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Step {idx + 1}</Badge>
                      <Badge>{step.type}</Badge>
                      {step.required && <Badge variant="destructive">Required</Badge>}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button size="icon" variant="ghost" onClick={() => moveStep(idx, -1)} disabled={idx === 0}>
                        <ArrowLeft className="h-3 w-3" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => moveStep(idx, 1)} disabled={idx === steps.length - 1}>
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => removeStep(idx)}>
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-medium">Title</Label>
                      <Input value={step.title} onChange={e => updateStepField(idx, "title", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-medium">Subtitle</Label>
                      <Input value={step.subtitle} onChange={e => updateStepField(idx, "subtitle", e.target.value)} />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Description (optional)</Label>
                    <Textarea
                      placeholder="Add a longer description or instructions for this step..."
                      value={(step as any).description || ""}
                      onChange={e => updateStepField(idx, "description", e.target.value)}
                      rows={2}
                    />
                  </div>

                  {/* Required toggle + Weight */}
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={step.required}
                        onCheckedChange={v => updateStepField(idx, "required", v)}
                      />
                      <Label className="text-xs">Required step</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="text-xs">Scoring Weight</Label>
                      <Input
                        type="number" step="0.05" min="0" max="1"
                        className="w-20 h-7 text-xs"
                        value={step.weight ?? 0}
                        onChange={e => updateStepField(idx, "weight", parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </div>

                  {/* DB column for radio/checkbox/text_input */}
                  {(step.type === "radio" || step.type === "checkbox" || step.type === "text_input") && (
                    <div className="space-y-2">
                      <Label className="text-xs font-medium">DB Column</Label>
                      <Input
                        placeholder="e.g. hair_shedding"
                        value={step.db_column || ""}
                        onChange={e => updateStepField(idx, "db_column", e.target.value)}
                      />
                    </div>
                  )}

                  {/* Placeholder for text_input */}
                  {step.type === "text_input" && (
                    <div className="space-y-2">
                      <Label className="text-xs font-medium">Placeholder Text</Label>
                      <Input
                        placeholder="e.g. Describe your scalp condition..."
                        value={(step as any).placeholder || ""}
                        onChange={e => updateStepField(idx, "placeholder", e.target.value)}
                      />
                    </div>
                  )}

                  {/* Options for radio/checkbox steps */}
                  {(step.type === "radio" || step.type === "checkbox") && step.options && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-medium">Options</Label>
                        <Button size="sm" variant="outline" onClick={() => addOptionToStep(idx)}>
                          <Plus className="h-3 w-3 mr-1" /> Add
                        </Button>
                      </div>
                      {step.options.map((opt, optIdx) => (
                        <div key={optIdx} className="flex items-center gap-2">
                          <Input
                            placeholder="DB value"
                            className="flex-1 text-sm"
                            value={opt.value}
                            onChange={e => updateOption(idx, optIdx, "value", e.target.value)}
                          />
                          <Input
                            placeholder="Display label"
                            className="flex-1 text-sm"
                            value={opt.label}
                            onChange={e => updateOption(idx, optIdx, "label", e.target.value)}
                          />
                          <Button size="icon" variant="ghost" onClick={() => removeOption(idx, optIdx)}>
                            <Trash2 className="h-3 w-3 text-destructive" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Lifestyle fields */}
                  {step.type === "lifestyle_group" && step.fields && (
                    <div className="space-y-3">
                      <Label className="text-xs font-medium">Fields</Label>
                      {(step.fields as QuizField[]).map((field, fIdx) => (
                        <div key={fIdx} className="p-3 bg-muted/40 rounded-lg space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">{field.type}</Badge>
                            <span className="text-sm font-medium">{field.label}</span>
                            {field.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
                          </div>
                          {field.options && (
                            <div className="flex flex-wrap gap-1">
                              {field.options.map((o, oi) => (
                                <Badge key={oi} variant="secondary" className="text-xs">{o.label} ({o.value})</Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Photo fields */}
                  {step.type === "photo_upload" && step.fields && (
                    <div className="flex flex-wrap gap-2">
                      {(step.fields as PhotoField[]).map((f, fi) => (
                        <Badge key={fi} variant="secondary">{f.label} → {f.db_column}</Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            <div ref={stepsEndRef} />
          </TabsContent>

          {/* ─── Scoring Tab ──────────────────── */}
          <TabsContent value="scoring" className="space-y-6">
            {scoring && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Factor Weights</CardTitle>
                    <CardDescription>Must sum to 1.0 — controls each factor's impact on final score</CardDescription>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Object.entries(scoring.weights).map(([key, val]) => (
                      <div key={key} className="space-y-1">
                        <Label className="text-xs capitalize">{key.replace("_", " ")}</Label>
                        <Input
                          type="number" step="0.05" min="0" max="1"
                          value={val}
                          onChange={e => updateScoringField(`weights.${key}`, parseFloat(e.target.value) || 0)}
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Shedding Scores</CardTitle>
                    <CardDescription>Score (0-100) for each shedding level</CardDescription>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(scoring.shedding_scores).map(([key, val]) => (
                      <div key={key} className="space-y-1">
                        <Label className="text-xs">{key}</Label>
                        <Input
                          type="number" min="0" max="100"
                          value={val}
                          onChange={e => updateScoringField(`shedding_scores.${key}`, parseInt(e.target.value) || 0)}
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Scalp Feel Scores</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(scoring.scalp_feel_scores).map(([key, val]) => (
                      <div key={key} className="space-y-1">
                        <Label className="text-xs">{key}</Label>
                        <Input
                          type="number" min="0" max="100"
                          value={val}
                          onChange={e => updateScoringField(`scalp_feel_scores.${key}`, parseInt(e.target.value) || 0)}
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Stress & Sleep Scores</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      {Object.entries(scoring.stress_scores).map(([key, val]) => (
                        <div key={key} className="space-y-1">
                          <Label className="text-xs">Stress: {key}</Label>
                          <Input
                            type="number" min="0" max="100" value={val}
                            onChange={e => updateScoringField(`stress_scores.${key}`, parseInt(e.target.value) || 0)}
                          />
                        </div>
                      ))}
                    </div>
                    <Separator />
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <Label className="text-xs">Symptom Penalty / Item</Label>
                        <Input
                          type="number" value={scoring.symptom_penalty_per_item}
                          onChange={e => updateScoringField("symptom_penalty_per_item", parseInt(e.target.value) || 0)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Symptom Penalty Max</Label>
                        <Input
                          type="number" value={scoring.symptom_penalty_max}
                          onChange={e => updateScoringField("symptom_penalty_max", parseInt(e.target.value) || 0)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Change Penalty / Item</Label>
                        <Input
                          type="number" value={scoring.change_penalty_per_item}
                          onChange={e => updateScoringField("change_penalty_per_item", parseInt(e.target.value) || 0)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* ─── Messages Tab ─────────────────── */}
          <TabsContent value="messages" className="space-y-6">
            {scoring && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Improvement Messages</CardTitle>
                    <CardDescription>Shown in the report based on score thresholds</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Object.entries(scoring.improvement_messages).map(([key, msg]) => (
                      <div key={key} className="space-y-1">
                        <Label className="text-xs capitalize">
                          {key} (below {scoring.improvement_thresholds[key] || "∞"})
                        </Label>
                        <Input
                          value={msg}
                          onChange={e => updateScoringField(`improvement_messages.${key}`, e.target.value)}
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <MessageRulesEditor
                  rules={(scoring.issue_rules || []) as IssueRule[]}
                  steps={steps}
                  onChange={(rules) => updateScoringField("issue_rules", rules)}
                />

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Scalp Type Labels</CardTitle>
                    <CardDescription>Display names for each scalp feel type in reports</CardDescription>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    {Object.entries(scoring.scalp_feel_labels).map(([key, label]) => (
                      <div key={key} className="space-y-1">
                        <Label className="text-xs">{key}</Label>
                        <Input
                          value={label}
                          onChange={e => updateScoringField(`scalp_feel_labels.${key}`, e.target.value)}
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────
// Message Rules — no-code rule builder for the report's issue messages.
// Each rule answers: "If this question/answer matches → show this message."
// Persisted into scoring.issue_rules (mixed legacy + structured rules).
// ─────────────────────────────────────────────────────────────────────────

type Operator = NonNullable<IssueRule["operator"]>;

const OPERATORS: { value: Operator; label: string; help: string }[] = [
  { value: "equals", label: "equals", help: "Exact match (e.g. answer is exactly 'high')" },
  { value: "not_equals", label: "not equals", help: "Anything except this value" },
  { value: "greater_than", label: "greater than", help: "Numeric — answer > value" },
  { value: "less_than", label: "less than", help: "Numeric — answer < value" },
  { value: "between", label: "between", help: "Numeric range. Value format: min,max" },
  { value: "contains", label: "contains", help: "For multi-select / text answers" },
  { value: "count_gt", label: "count greater than", help: "Multi-select length > value" },
  { value: "count_lt", label: "count less than", help: "Multi-select length < value" },
];

const SEVERITIES: { value: NonNullable<IssueRule["severity"]>; label: string; tone: string }[] = [
  { value: "info", label: "Info", tone: "bg-muted text-foreground" },
  { value: "warning", label: "Warning", tone: "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-100" },
  { value: "critical", label: "Critical", tone: "bg-destructive/15 text-destructive" },
];

interface MessageRulesEditorProps {
  rules: IssueRule[];
  steps: QuizStep[];
  onChange: (rules: IssueRule[]) => void;
}

const MessageRulesEditor: React.FC<MessageRulesEditorProps> = ({ rules, steps, onChange }) => {
  // Build the list of selectable "questions" (db_columns) from the quiz steps.
  const questionOptions = React.useMemo(() => {
    const out: { value: string; label: string }[] = [];
    const seen = new Set<string>();
    const push = (col?: string, label?: string) => {
      if (!col || seen.has(col)) return;
      seen.add(col);
      out.push({ value: col, label: label ? `${label} (${col})` : col });
    };
    steps.forEach((s) => {
      push(s.db_column, s.title);
      (s.fields || []).forEach((f: any) => push(f.db_column, f.label));
    });
    return out.sort((a, b) => a.label.localeCompare(b.label));
  }, [steps]);

  const updateAt = (idx: number, patch: Partial<IssueRule>) => {
    onChange(rules.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  };
  const removeAt = (idx: number) => onChange(rules.filter((_, i) => i !== idx));
  const move = (idx: number, dir: -1 | 1) => {
    const j = idx + dir;
    if (j < 0 || j >= rules.length) return;
    const arr = [...rules];
    [arr[idx], arr[j]] = [arr[j], arr[idx]];
    onChange(arr);
  };
  const addRule = () => {
    onChange([
      ...rules,
      {
        name: "New rule",
        question: questionOptions[0]?.value || "",
        operator: "equals",
        value: "",
        message: "",
        severity: "info",
        priority: rules.length + 1,
        premium_only: false,
        active: true,
      },
    ]);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Message Rules
            </CardTitle>
            <CardDescription>
              No-code rule builder. When a rule's condition matches a user's
              answer, its message is shown in the report. Rules are evaluated
              in priority order (lowest number first).
            </CardDescription>
          </div>
          <Button size="sm" variant="hero" onClick={addRule}>
            <Plus className="h-3 w-3 mr-1" /> Add Rule
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {rules.length === 0 && (
          <p className="text-sm text-muted-foreground italic">
            No rules yet — add your first rule to start showing personalised
            messages in the report.
          </p>
        )}
        {rules.map((rule, idx) => {
          const isLegacy = !rule.question && !!rule.condition;
          const sev = SEVERITIES.find((s) => s.value === rule.severity) || SEVERITIES[0];
          return (
            <div
              key={idx}
              className={`rounded-lg border p-4 space-y-3 ${
                rule.active === false ? "opacity-60 bg-muted/30" : "bg-card"
              }`}
            >
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline">#{idx + 1}</Badge>
                  <Badge className={sev.tone}>{sev.label}</Badge>
                  {rule.premium_only && (
                    <Badge variant="secondary" className="gap-1">
                      <Crown className="h-3 w-3" /> Premium only
                    </Badge>
                  )}
                  {isLegacy && <Badge variant="outline" className="text-xs">Legacy</Badge>}
                  {rule.active === false && <Badge variant="destructive">Disabled</Badge>}
                </div>
                <div className="flex items-center gap-1">
                  <Button size="icon" variant="ghost" onClick={() => move(idx, -1)} disabled={idx === 0}>
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => move(idx, 1)} disabled={idx === rules.length - 1}>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => removeAt(idx)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>

              {isLegacy ? (
                <div className="space-y-2 text-sm">
                  <p className="font-mono text-xs text-muted-foreground">
                    Condition: {rule.condition}
                  </p>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Output Message</Label>
                    <FieldHelp>
                      Legacy string-based rule. Edit the message below or
                      delete and rebuild it as a structured rule.
                    </FieldHelp>
                    <Input
                      value={rule.message || rule.template || ""}
                      onChange={(e) => updateAt(idx, { message: e.target.value })}
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Rule Name</Label>
                      <FieldHelp>For your reference only — never shown to users.</FieldHelp>
                      <Input
                        value={rule.name || ""}
                        onChange={(e) => updateAt(idx, { name: e.target.value })}
                        placeholder="e.g. Heavy shedding warning"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Question</Label>
                      <FieldHelp>The quiz answer (db column) this rule looks at.</FieldHelp>
                      <Select
                        value={rule.question || ""}
                        onValueChange={(v) => updateAt(idx, { question: v })}
                      >
                        <SelectTrigger><SelectValue placeholder="Pick a question…" /></SelectTrigger>
                        <SelectContent>
                          {questionOptions.map((q) => (
                            <SelectItem key={q.value} value={q.value}>{q.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Operator</Label>
                      <FieldHelp>
                        {OPERATORS.find((o) => o.value === rule.operator)?.help || "How to compare."}
                      </FieldHelp>
                      <Select
                        value={rule.operator || "equals"}
                        onValueChange={(v) => updateAt(idx, { operator: v as Operator })}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {OPERATORS.map((o) => (
                            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                      <Label className="text-xs">Value</Label>
                      <FieldHelp>
                        {rule.operator === "between"
                          ? "Two numbers separated by a comma (e.g. 100,150)."
                          : "The value to compare the answer against."}
                      </FieldHelp>
                      <Input
                        value={String(rule.value ?? "")}
                        onChange={(e) => updateAt(idx, { value: e.target.value })}
                        placeholder={
                          rule.operator === "between"
                            ? "100,150"
                            : rule.operator?.startsWith("count_")
                            ? "0"
                            : "high"
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Output Message</Label>
                    <FieldHelp>
                      Shown in the report when this rule matches. Use{" "}
                      <code className="px-1 rounded bg-muted text-[10px]">{"{count}"}</code> and{" "}
                      <code className="px-1 rounded bg-muted text-[10px]">{"{s}"}</code> for
                      array-based rules (e.g. "{"{count}"} symptom{"{s}"} detected").
                    </FieldHelp>
                    <Textarea
                      rows={2}
                      value={rule.message || rule.template || ""}
                      onChange={(e) => updateAt(idx, { message: e.target.value })}
                      placeholder="e.g. Heavy hair shedding (150+ strands/day)"
                    />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 items-end">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Priority</Label>
                      <FieldHelp>Lower runs first.</FieldHelp>
                      <Input
                        type="number"
                        min={1}
                        value={rule.priority ?? 100}
                        onChange={(e) => updateAt(idx, { priority: parseInt(e.target.value) || 100 })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Severity</Label>
                      <FieldHelp>Visual tag in the report.</FieldHelp>
                      <Select
                        value={rule.severity || "info"}
                        onValueChange={(v) => updateAt(idx, { severity: v as any })}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {SEVERITIES.map((s) => (
                            <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-2 pt-5">
                      <Switch
                        id={`premium-${idx}`}
                        checked={!!rule.premium_only}
                        onCheckedChange={(v) => updateAt(idx, { premium_only: v })}
                      />
                      <Label htmlFor={`premium-${idx}`} className="text-xs">Premium only</Label>
                    </div>
                    <div className="flex items-center gap-2 pt-5">
                      <Switch
                        id={`active-${idx}`}
                        checked={rule.active !== false}
                        onCheckedChange={(v) => updateAt(idx, { active: v })}
                      />
                      <Label htmlFor={`active-${idx}`} className="text-xs">Active</Label>
                    </div>
                  </div>

                  {rule.question && rule.operator && (
                    <div className="rounded-md bg-muted/50 px-3 py-2 text-xs font-mono text-muted-foreground">
                      <span className="text-foreground">Preview:</span> if{" "}
                      <span className="text-primary">{rule.question}</span>{" "}
                      <span>{rule.operator}</span>{" "}
                      <span className="text-primary">{String(rule.value ?? "")}</span>{" "}
                      → "{rule.message || "(no message)"}"
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default AdminScalpQuiz;
