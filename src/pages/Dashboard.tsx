import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import PremiumGate from "@/components/PremiumGate";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import Navbar from "@/components/landing/Navbar";
import { Camera, TrendingDown, TrendingUp, BarChart3, Calendar, FileText, ClipboardList, Activity, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { calculateAndSaveScore, fetchAllScores, type WeeklyScore } from "@/lib/scoreCalculator";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";

interface RoutineTask {
  id: string;
  title: string;
  description: string | null;
  week_number: number;
  day_of_week: number | null;
  is_completed: boolean;
}

interface UserReport {
  id: string;
  scalp_score: number;
  recovery_week: number;
  created_at: string;
  notes: string | null;
}

interface HairFallLog {
  id: string;
  count: number;
  logged_at: string;
}

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { isPremium } = useSubscription();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [tasks, setTasks] = useState<RoutineTask[]>([]);
  const [reports, setReports] = useState<UserReport[]>([]);
  const [hairLogs, setHairLogs] = useState<HairFallLog[]>([]);
  const [displayName, setDisplayName] = useState("");
  const [hairFallCount, setHairFallCount] = useState("");
  const [hairFallOpen, setHairFallOpen] = useState(false);

  // Score state
  const [currentScore, setCurrentScore] = useState(0);
  const [scores, setScores] = useState<WeeklyScore[]>([]);
  const [scoreDelta, setScoreDelta] = useState<number | null>(null);
  const [scoreMessage, setScoreMessage] = useState("");

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      const [profileRes, tasksRes, reportsRes, logsRes] = await Promise.all([
        supabase.from("profiles").select("display_name").eq("id", user.id).single(),
        supabase.from("routine_tasks").select("*").eq("user_id", user.id).order("week_number").order("day_of_week"),
        supabase.from("user_reports").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("hair_fall_logs").select("*").eq("user_id", user.id).order("logged_at", { ascending: false }).limit(7),
      ]);

      if (profileRes.data) setDisplayName(profileRes.data.display_name || "");
      if (tasksRes.data) setTasks(tasksRes.data);
      if (reportsRes.data) setReports(reportsRes.data);
      if (logsRes.data) setHairLogs(logsRes.data);

      // Calculate current week number (weeks since first report or 1)
      const recoveryWeek = reportsRes.data?.[0]?.recovery_week ?? 1;

      // Calculate & save score for current week
      const breakdown = await calculateAndSaveScore(user.id, recoveryWeek);
      setCurrentScore(breakdown.score);

      // Fetch all historical scores
      const allScores = await fetchAllScores(user.id);
      setScores(allScores);

      // Calculate delta
      if (allScores.length >= 2) {
        const prev = allScores[allScores.length - 2];
        const curr = allScores[allScores.length - 1];
        const delta = curr.score - prev.score;
        setScoreDelta(delta);
        if (delta > 0) {
          setScoreMessage(`Your scalp health improved by ${delta}% this week. Keep it up! 🎉`);
        } else if (delta < 0) {
          setScoreMessage(`Your score dipped by ${Math.abs(delta)}%. Try focusing on daily habits and logging your symptoms regularly.`);
        } else {
          setScoreMessage("Your score is steady. Stay consistent with your routine!");
        }
      } else if (allScores.length === 1) {
        setScoreMessage("Your first score is in! Keep tracking to see your improvement trend.");
      }
    };

    fetchData();
  }, [user]);

  const latestReport = reports[0];
  const recoveryWeek = latestReport?.recovery_week ?? 1;
  const completedTasks = tasks.filter((t) => t.is_completed).length;
  const totalTasks = tasks.length;
  const weekProgress = Math.round((recoveryWeek / 6) * 100);

  const todayDow = new Date().getDay();
  const todayTasks = tasks.filter((t) => t.day_of_week === null || t.day_of_week === todayDow);
  const weekTasks = tasks.filter((t) => t.week_number === recoveryWeek);

  const toggleTask = async (taskId: string, completed: boolean) => {
    await supabase.from("routine_tasks").update({ is_completed: completed, completed_at: completed ? new Date().toISOString() : null }).eq("id", taskId);
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, is_completed: completed } : t)));
  };

  const submitHairFall = async () => {
    if (!user || !hairFallCount) return;
    const { error } = await supabase.from("hair_fall_logs").insert({ user_id: user.id, count: parseInt(hairFallCount) });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Logged!", description: `${hairFallCount} strands recorded.` });
      setHairFallCount("");
      setHairFallOpen(false);
      const { data } = await supabase.from("hair_fall_logs").select("*").eq("user_id", user.id).order("logged_at", { ascending: false }).limit(7);
      if (data) setHairLogs(data);
    }
  };

  const chartData = scores.map((s) => ({
    week: `Wk ${s.week_number}`,
    score: s.score,
  }));

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground font-body">Loading…</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 container mx-auto px-4 max-w-5xl space-y-8">
        {/* Header */}
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
            Welcome back{displayName ? `, ${displayName}` : ""}
          </h1>
          <p className="text-muted-foreground font-body mt-1">Here's your scalp health overview.</p>
        </div>

        {/* Scalp Recovery Score Hero Card */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card className="shadow-elevated border-primary/20 bg-gradient-to-br from-card to-accent/20">
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                {/* Score Circle */}
                <div className="flex-shrink-0 flex flex-col items-center">
                  <div className="relative w-32 h-32">
                    <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                      <circle cx="60" cy="60" r="52" fill="none" stroke="hsl(var(--muted))" strokeWidth="10" />
                      <circle
                        cx="60" cy="60" r="52" fill="none"
                        stroke="hsl(var(--primary))" strokeWidth="10"
                        strokeLinecap="round"
                        strokeDasharray={`${(currentScore / 100) * 327} 327`}
                        className="transition-all duration-1000"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-display font-bold text-foreground">{currentScore}</span>
                      <span className="text-xs text-muted-foreground font-body">/100</span>
                    </div>
                  </div>
                  <p className="font-body text-xs uppercase tracking-wider text-muted-foreground mt-2">Recovery Score</p>
                </div>

                {/* Score Details */}
                <div className="flex-1 space-y-3">
                  {/* Delta Badge */}
                  {scoreDelta !== null && (
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-body font-medium ${scoreDelta > 0 ? "bg-accent text-accent-foreground" : scoreDelta < 0 ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"}`}>
                      {scoreDelta > 0 ? <TrendingUp className="h-4 w-4" /> : scoreDelta < 0 ? <TrendingDown className="h-4 w-4" /> : <Activity className="h-4 w-4" />}
                      {scoreDelta > 0 ? `+${scoreDelta}%` : scoreDelta < 0 ? `${scoreDelta}%` : "No change"}
                    </div>
                  )}

                  <p className="font-body text-sm text-foreground">{scoreMessage}</p>

                  {/* Component breakdown */}
                  {scores.length > 0 && (() => {
                    const latest = scores[scores.length - 1];
                    const components = [
                      { label: "Habits", value: latest.habit_score, max: 20 },
                      { label: "Hair Fall", value: latest.hairfall_score, max: 20 },
                      { label: "Symptoms", value: latest.symptom_score, max: 20 },
                      { label: "Protocol", value: latest.protocol_score, max: 20 },
                      { label: "Photos", value: latest.photo_score, max: 20 },
                    ];
                    return (
                      <div className="grid grid-cols-5 gap-2 pt-2">
                        {components.map((c) => (
                          <div key={c.label} className="text-center">
                            <div className="relative h-1.5 bg-muted rounded-full overflow-hidden mb-1">
                              <div className="absolute h-full bg-primary rounded-full transition-all" style={{ width: `${(c.value / c.max) * 100}%` }} />
                            </div>
                            <span className="text-[10px] text-muted-foreground font-body">{c.label}</span>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Score Trend Chart */}
        {chartData.length > 1 && (
          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-lg flex items-center gap-2"><BarChart3 className="h-5 w-5 text-primary" /> Score Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="week" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "var(--radius)" }} />
                  <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ fill: "hsl(var(--primary))", r: 5 }} name="Score" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardDescription className="font-body text-xs uppercase tracking-wider">Recovery Week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-display font-bold text-foreground">{recoveryWeek}<span className="text-lg text-muted-foreground">/6</span></div>
              <Progress value={weekProgress} className="mt-3 h-2" />
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardDescription className="font-body text-xs uppercase tracking-wider">Completed Tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-display font-bold text-foreground">{completedTasks}<span className="text-lg text-muted-foreground">/{totalTasks || "—"}</span></div>
              <Progress value={totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0} className="mt-3 h-2" />
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <Button variant="hero" size="lg" asChild>
            <Link to="/photos"><Camera className="mr-2 h-4 w-4" /> Upload Scalp Photo</Link>
          </Button>

          <Dialog open={hairFallOpen} onOpenChange={setHairFallOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="lg"><TrendingDown className="mr-2 h-4 w-4" /> Update Hair Fall Count</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-display">Log Hair Fall</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label>Number of strands lost today</Label>
                  <Input type="number" min={0} value={hairFallCount} onChange={(e) => setHairFallCount(e.target.value)} placeholder="e.g. 75" />
                </div>
                <Button variant="hero" className="w-full" onClick={submitHairFall} disabled={!hairFallCount}>Save</Button>
              </div>
            </DialogContent>
          </Dialog>

          <Button variant="outline" size="lg" asChild>
            <Link to="/progress"><BarChart3 className="mr-2 h-4 w-4" /> View Progress</Link>
          </Button>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Today's Routine */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="font-display text-lg flex items-center gap-2"><Calendar className="h-5 w-5 text-primary" /> Today's Routine</CardTitle>
              <Button variant="ghost" size="sm" asChild className="ml-auto"><Link to="/habits">View Habits →</Link></Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {todayTasks.length === 0 ? (
                <p className="text-muted-foreground font-body text-sm">No tasks for today. Take the quiz to generate your recovery protocol!</p>
              ) : (
                todayTasks.map((task) => (
                  <label key={task.id} className="flex items-start gap-3 cursor-pointer group">
                    <Checkbox checked={task.is_completed} onCheckedChange={(checked) => toggleTask(task.id, !!checked)} className="mt-0.5" />
                    <div>
                      <span className={`font-body text-sm ${task.is_completed ? "line-through text-muted-foreground" : "text-foreground"}`}>{task.title}</span>
                      {task.description && <p className="text-xs text-muted-foreground mt-0.5">{task.description}</p>}
                    </div>
                  </label>
                ))
              )}
            </CardContent>
          </Card>

          {/* Weekly Protocol */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="font-display text-lg flex items-center gap-2"><ClipboardList className="h-5 w-5 text-primary" /> Week {recoveryWeek} Protocol</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {weekTasks.length === 0 ? (
                <p className="text-muted-foreground font-body text-sm">No protocol tasks yet. Complete the scalp scan to get started.</p>
              ) : (
                weekTasks.map((task) => (
                  <label key={task.id} className="flex items-start gap-3 cursor-pointer">
                    <Checkbox checked={task.is_completed} onCheckedChange={(checked) => toggleTask(task.id, !!checked)} className="mt-0.5" />
                    <div>
                      <span className={`font-body text-sm ${task.is_completed ? "line-through text-muted-foreground" : "text-foreground"}`}>{task.title}</span>
                      {task.description && <p className="text-xs text-muted-foreground mt-0.5">{task.description}</p>}
                    </div>
                  </label>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Saved Reports */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-display text-lg flex items-center gap-2"><FileText className="h-5 w-5 text-primary" /> Saved Reports</CardTitle>
          </CardHeader>
          <CardContent>
            {reports.length === 0 ? (
              <p className="text-muted-foreground font-body text-sm">No reports yet. Take the scalp scan quiz to generate your first report.</p>
            ) : (
              <div className="space-y-3">
                {reports.map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-body text-sm font-medium text-foreground">Score: {report.scalp_score}/100 — Week {report.recovery_week}</p>
                      <p className="text-xs text-muted-foreground">{new Date(report.created_at).toLocaleDateString()}</p>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to="/report">View</Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Hair Fall Logs */}
        {hairLogs.length > 0 && (
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="font-display text-lg flex items-center gap-2"><TrendingDown className="h-5 w-5 text-primary" /> Recent Hair Fall Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 overflow-x-auto pb-2">
                {hairLogs.map((log) => (
                  <div key={log.id} className="flex-shrink-0 text-center p-3 rounded-lg bg-muted/50 min-w-[80px]">
                    <p className="font-display text-xl font-bold text-foreground">{log.count}</p>
                    <p className="text-xs text-muted-foreground">{new Date(log.logged_at).toLocaleDateString(undefined, { weekday: "short" })}</p>
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

export default Dashboard;
