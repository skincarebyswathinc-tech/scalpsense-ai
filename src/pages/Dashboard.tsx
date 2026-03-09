import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import Navbar from "@/components/landing/Navbar";
import { Camera, TrendingDown, BarChart3, Calendar, FileText, ClipboardList } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

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
  const navigate = useNavigate();
  const { toast } = useToast();

  const [tasks, setTasks] = useState<RoutineTask[]>([]);
  const [reports, setReports] = useState<UserReport[]>([]);
  const [hairLogs, setHairLogs] = useState<HairFallLog[]>([]);
  const [displayName, setDisplayName] = useState("");
  const [hairFallCount, setHairFallCount] = useState("");
  const [hairFallOpen, setHairFallOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
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
    };

    fetchData();
  }, [user]);

  const latestReport = reports[0];
  const scalpScore = latestReport?.scalp_score ?? 0;
  const recoveryWeek = latestReport?.recovery_week ?? 1;
  const completedTasks = tasks.filter((t) => t.is_completed).length;
  const totalTasks = tasks.length;
  const weekProgress = Math.round((recoveryWeek / 6) * 100);

  const todayDow = new Date().getDay();
  const todayTasks = tasks.filter((t) => t.day_of_week === null || t.day_of_week === todayDow);
  const weekTasks = tasks.filter((t) => t.week_number === recoveryWeek);

  const toggleTask = async (taskId: string, completed: boolean) => {
    await supabase
      .from("routine_tasks")
      .update({ is_completed: completed, completed_at: completed ? new Date().toISOString() : null })
      .eq("id", taskId);
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

        {/* Score Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardDescription className="font-body text-xs uppercase tracking-wider">Scalp Health Score</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-display font-bold text-primary">{scalpScore}<span className="text-lg text-muted-foreground">/100</span></div>
              <Progress value={scalpScore} className="mt-3 h-2" />
            </CardContent>
          </Card>

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
            <Link to="/quiz"><Camera className="mr-2 h-4 w-4" /> Upload Scalp Photo</Link>
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
