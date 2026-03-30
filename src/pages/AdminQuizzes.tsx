import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/landing/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Plus, Pencil, Trash2, Upload, Sparkles, FileJson, FileSpreadsheet,
  ShieldCheck, ChevronDown, ChevronUp, Loader2,
} from "lucide-react";

interface Quiz {
  id: string;
  title: string;
  description: string | null;
  topic: string | null;
  difficulty: string;
  version: number;
  is_active: boolean;
  created_at: string;
}

interface QuizQuestion {
  id?: string;
  quiz_id?: string;
  question_text: string;
  options: string[];
  correct_answer: string;
  explanation: string | null;
  sort_order: number;
}

const AdminQuizzes = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Quiz | null>(null);
  const [expandedQuiz, setExpandedQuiz] = useState<string | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [generating, setGenerating] = useState(false);
  const [uploadTab, setUploadTab] = useState("manual");

  // Form state
  const [form, setForm] = useState({
    title: "", description: "", topic: "", difficulty: "medium", is_active: true,
  });
  const [aiTopic, setAiTopic] = useState("");
  const [aiDifficulty, setAiDifficulty] = useState("medium");
  const [aiCount, setAiCount] = useState(5);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/auth"); return; }
    const check = async () => {
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin");
      if (data && data.length > 0) { setIsAdmin(true); fetchQuizzes(); }
      setChecking(false);
    };
    check();
  }, [user, authLoading]);

  const fetchQuizzes = async () => {
    const { data } = await supabase.from("quizzes" as any).select("*").order("created_at", { ascending: false });
    if (data) setQuizzes(data as any);
  };

  const fetchQuestions = async (quizId: string) => {
    const { data } = await supabase.from("quiz_questions" as any).select("*").eq("quiz_id", quizId).order("sort_order");
    if (data) setQuestions(data as any);
  };

  const toggleExpand = async (quizId: string) => {
    if (expandedQuiz === quizId) { setExpandedQuiz(null); return; }
    setExpandedQuiz(quizId);
    await fetchQuestions(quizId);
  };

  const openNew = () => {
    setEditing(null);
    setForm({ title: "", description: "", topic: "", difficulty: "medium", is_active: true });
    setDialogOpen(true);
  };

  const openEdit = (quiz: Quiz) => {
    setEditing(quiz);
    setForm({
      title: quiz.title, description: quiz.description || "",
      topic: quiz.topic || "", difficulty: quiz.difficulty, is_active: quiz.is_active,
    });
    setDialogOpen(true);
  };

  const saveQuiz = async () => {
    if (!form.title.trim()) { toast({ title: "Title required", variant: "destructive" }); return; }
    const payload = { ...form, created_by: user?.id };
    if (editing) {
      const { error } = await supabase.from("quizzes" as any).update(payload as any).eq("id", editing.id);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Quiz updated" });
    } else {
      const { error } = await supabase.from("quizzes" as any).insert(payload as any);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Quiz created" });
    }
    setDialogOpen(false);
    fetchQuizzes();
  };

  const deleteQuiz = async (id: string) => {
    if (!confirm("Delete this quiz and all its questions?")) return;
    const { error } = await supabase.from("quizzes" as any).delete().eq("id", id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Quiz deleted" });
    if (expandedQuiz === id) setExpandedQuiz(null);
    fetchQuizzes();
  };

  const toggleActive = async (quiz: Quiz) => {
    await supabase.from("quizzes" as any).update({ is_active: !quiz.is_active } as any).eq("id", quiz.id);
    fetchQuizzes();
  };

  // AI Generation
  const generateWithAI = async () => {
    if (!aiTopic.trim()) { toast({ title: "Enter a topic", variant: "destructive" }); return; }
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-quiz", {
        body: { topic: aiTopic, difficulty: aiDifficulty, numQuestions: aiCount },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      // Create quiz
      const { data: quiz, error: qErr } = await supabase.from("quizzes" as any).insert({
        title: `${aiTopic} Quiz`,
        description: `AI-generated ${aiDifficulty} quiz about ${aiTopic}`,
        topic: aiTopic,
        difficulty: aiDifficulty,
        created_by: user?.id,
      } as any).select().single();
      if (qErr) throw qErr;

      // Insert questions
      const questionsToInsert = (data.questions || []).map((q: any, i: number) => ({
        quiz_id: (quiz as any).id,
        question_text: q.question_text,
        options: q.options,
        correct_answer: q.correct_answer,
        explanation: q.explanation || null,
        sort_order: i,
      }));

      if (questionsToInsert.length > 0) {
        await supabase.from("quiz_questions" as any).insert(questionsToInsert as any);
      }

      toast({ title: "Quiz generated!", description: `${questionsToInsert.length} questions created.` });
      setAiTopic("");
      fetchQuizzes();
    } catch (err: any) {
      toast({ title: "Generation failed", description: err.message, variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  // CSV/JSON Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      let parsedQuestions: any[] = [];

      if (file.name.endsWith(".json")) {
        const json = JSON.parse(text);
        parsedQuestions = Array.isArray(json) ? json : json.questions || [];
      } else if (file.name.endsWith(".csv")) {
        const lines = text.split("\n").filter(Boolean);
        const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
        parsedQuestions = lines.slice(1).map(line => {
          const values = line.split(",").map(v => v.trim());
          const obj: any = {};
          headers.forEach((h, i) => { obj[h] = values[i] || ""; });
          return {
            question_text: obj.question || obj.question_text || "",
            options: [obj.option_a || obj.a, obj.option_b || obj.b, obj.option_c || obj.c, obj.option_d || obj.d].filter(Boolean),
            correct_answer: obj.answer || obj.correct_answer || "",
            explanation: obj.explanation || null,
          };
        });
      } else {
        toast({ title: "Unsupported file", description: "Use .csv or .json", variant: "destructive" });
        return;
      }

      // Validate
      const valid = parsedQuestions.filter(q =>
        q.question_text && q.options?.length >= 2 && q.correct_answer
      );

      if (valid.length === 0) {
        toast({ title: "No valid questions found", description: "Check your file format.", variant: "destructive" });
        return;
      }

      // Create quiz from file
      const title = file.name.replace(/\.(csv|json)$/, "");
      const { data: quiz, error: qErr } = await supabase.from("quizzes" as any).insert({
        title,
        description: `Imported from ${file.name}`,
        created_by: user?.id,
      } as any).select().single();
      if (qErr) throw qErr;

      const questionsToInsert = valid.map((q: any, i: number) => ({
        quiz_id: (quiz as any).id,
        question_text: q.question_text,
        options: q.options,
        correct_answer: q.correct_answer,
        explanation: q.explanation || null,
        sort_order: i,
      }));

      await supabase.from("quiz_questions" as any).insert(questionsToInsert as any);
      toast({ title: "Import successful!", description: `${valid.length} questions imported.` });
      fetchQuizzes();
    } catch (err: any) {
      toast({ title: "Import failed", description: err.message, variant: "destructive" });
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const deleteQuestion = async (qId: string, quizId: string) => {
    await supabase.from("quiz_questions" as any).delete().eq("id", qId);
    fetchQuestions(quizId);
  };

  if (checking || authLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <p className="text-muted-foreground font-body">Checking permissions…</p>
    </div>;
  }

  if (!isAdmin) {
    return <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 flex flex-col items-center justify-center gap-4">
        <ShieldCheck className="h-16 w-16 text-muted-foreground" />
        <h1 className="font-display text-2xl font-bold text-foreground">Admin Access Required</h1>
        <Button variant="outline" onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
      </div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 container mx-auto px-4 max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Quiz Management</h1>
            <p className="text-muted-foreground font-body text-sm mt-1">Create, upload, or AI-generate quizzes.</p>
          </div>
          <Button variant="hero" onClick={openNew}><Plus className="mr-2 h-4 w-4" /> Create Quiz</Button>
        </div>

        {/* Upload / AI Section */}
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-lg">Add Quizzes</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={uploadTab} onValueChange={setUploadTab}>
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="manual"><Plus className="h-3 w-3 mr-1" />Manual</TabsTrigger>
                <TabsTrigger value="upload"><Upload className="h-3 w-3 mr-1" />CSV/JSON</TabsTrigger>
                <TabsTrigger value="ai"><Sparkles className="h-3 w-3 mr-1" />AI Generate</TabsTrigger>
              </TabsList>

              <TabsContent value="manual">
                <p className="text-sm text-muted-foreground">Click "Create Quiz" to manually add a quiz and its questions.</p>
              </TabsContent>

              <TabsContent value="upload" className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Upload a CSV or JSON file with quiz questions.
                </p>
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1"><FileSpreadsheet className="h-3 w-3" /> CSV: question, option_a, option_b, option_c, option_d, answer, explanation</div>
                  <div className="flex items-center gap-1"><FileJson className="h-3 w-3" /> JSON: array of {`{question_text, options[], correct_answer, explanation}`}</div>
                </div>
                <input ref={fileInputRef} type="file" accept=".csv,.json" className="hidden" onChange={handleFileUpload} />
                <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="h-4 w-4 mr-2" /> Choose File
                </Button>
              </TabsContent>

              <TabsContent value="ai" className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Topic</Label>
                    <Input value={aiTopic} onChange={e => setAiTopic(e.target.value)} placeholder="e.g. Scalp Health Basics" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Difficulty</Label>
                    <Select value={aiDifficulty} onValueChange={setAiDifficulty}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Questions</Label>
                    <Input type="number" min={1} max={20} value={aiCount} onChange={e => setAiCount(Number(e.target.value))} />
                  </div>
                </div>
                <Button variant="hero" onClick={generateWithAI} disabled={generating || !aiTopic.trim()}>
                  {generating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                  {generating ? "Generating…" : "Generate Quiz"}
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Quiz List */}
        <div className="space-y-3">
          {quizzes.length === 0 && (
            <p className="text-center text-muted-foreground py-8 font-body">No quizzes yet. Create one above.</p>
          )}
          {quizzes.map(quiz => (
            <Card key={quiz.id} className={`shadow-card ${!quiz.is_active ? "opacity-50" : ""}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 cursor-pointer" onClick={() => toggleExpand(quiz.id)}>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-display font-bold text-foreground">{quiz.title}</span>
                      <Badge variant="outline" className="text-xs">{quiz.difficulty}</Badge>
                      <Badge variant="secondary" className="text-xs">v{quiz.version}</Badge>
                      {quiz.topic && <Badge className="text-xs bg-primary/10 text-primary">{quiz.topic}</Badge>}
                      {!quiz.is_active && <Badge variant="destructive" className="text-xs">Inactive</Badge>}
                    </div>
                    {quiz.description && <p className="text-xs text-muted-foreground mt-1">{quiz.description}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={quiz.is_active} onCheckedChange={() => toggleActive(quiz)} />
                    <Button variant="ghost" size="sm" onClick={() => openEdit(quiz)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => deleteQuiz(quiz.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => toggleExpand(quiz.id)}>
                      {expandedQuiz === quiz.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {/* Expanded Questions */}
                {expandedQuiz === quiz.id && (
                  <div className="mt-4 space-y-3 border-t border-border pt-4">
                    {questions.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No questions in this quiz.</p>
                    ) : questions.map((q, i) => (
                      <div key={q.id || i} className="p-3 rounded-lg bg-muted/50 space-y-2">
                        <div className="flex items-start justify-between">
                          <p className="font-body text-sm font-medium text-foreground">
                            {i + 1}. {q.question_text}
                          </p>
                          {q.id && (
                            <Button variant="ghost" size="sm" onClick={() => deleteQuestion(q.id!, quiz.id)}>
                              <Trash2 className="h-3 w-3 text-destructive" />
                            </Button>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-1">
                          {(q.options || []).map((opt: string, j: number) => (
                            <span key={j} className={`text-xs px-2 py-1 rounded ${opt === q.correct_answer ? "bg-primary/20 text-primary font-semibold" : "text-muted-foreground"}`}>
                              {String.fromCharCode(65 + j)}. {opt}
                            </span>
                          ))}
                        </div>
                        {q.explanation && <p className="text-xs text-muted-foreground italic">💡 {q.explanation}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Create/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-display">{editing ? "Edit Quiz" : "Create Quiz"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Topic</Label>
                  <Input value={form.topic} onChange={e => setForm({ ...form, topic: e.target.value })} placeholder="e.g. Scalp Care" />
                </div>
                <div className="space-y-2">
                  <Label>Difficulty</Label>
                  <Select value={form.difficulty} onValueChange={v => setForm({ ...form, difficulty: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button variant="hero" className="w-full" onClick={saveQuiz} disabled={!form.title.trim()}>
                {editing ? "Save Changes" : "Create Quiz"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminQuizzes;
