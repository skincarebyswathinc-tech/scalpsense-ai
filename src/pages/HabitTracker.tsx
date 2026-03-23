import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import PremiumGate from "@/components/PremiumGate";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import Navbar from "@/components/landing/Navbar";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Flame, Sparkles, Heart, Droplets, Wind, HandHelping } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const DEFAULT_HABITS = [
  { title: "Scalp Massage", description: "5-minute gentle circular scalp massage to stimulate blood flow", icon: "hand", sort_order: 0 },
  { title: "Therapeutic Shampoo", description: "Wash with your prescribed therapeutic shampoo — let sit 3 min", icon: "droplets", sort_order: 1 },
  { title: "Nutrition Targets", description: "Hit your protein, iron & biotin targets for the day", icon: "heart", sort_order: 2 },
  { title: "Hydration Goal", description: "Drink at least 8 glasses (2L) of water today", icon: "droplets", sort_order: 3 },
  { title: "Stress Reduction Breathing", description: "Complete a 5-minute box breathing or meditation session", icon: "wind", sort_order: 4 },
];

const ICON_MAP: Record<string, React.ReactNode> = {
  hand: <HandHelping className="h-5 w-5" />,
  droplets: <Droplets className="h-5 w-5" />,
  heart: <Heart className="h-5 w-5" />,
  wind: <Wind className="h-5 w-5" />,
};

interface Habit {
  id: string;
  title: string;
  description: string | null;
  icon: string | null;
  sort_order: number;
}

interface Completion {
  id: string;
  habit_id: string;
  completed_date: string;
}

const todayStr = () => new Date().toISOString().split("T")[0];

const HabitTracker = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<Completion[]>([]);
  const [allCompletions, setAllCompletions] = useState<Completion[]>([]);
  const [streak, setStreak] = useState(0);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [authLoading, user, navigate]);

  // Load habits & completions
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const [hRes, cRes, allCRes] = await Promise.all([
        supabase.from("daily_habits" as any).select("id, title, description, icon, sort_order").eq("user_id", user.id).eq("is_active", true).order("sort_order"),
        supabase.from("habit_completions" as any).select("id, habit_id, completed_date").eq("user_id", user.id).eq("completed_date", todayStr()),
        supabase.from("habit_completions" as any).select("id, habit_id, completed_date").eq("user_id", user.id).order("completed_date", { ascending: false }),
      ]);

      let habitData = (hRes.data ?? []) as any as Habit[];

      // Seed default habits if none exist
      if (habitData.length === 0 && !seeding) {
        setSeeding(true);
        const rows = DEFAULT_HABITS.map((h) => ({ ...h, user_id: user.id }));
        await supabase.from("daily_habits" as any).insert(rows as any);
        const { data: newH } = await supabase.from("daily_habits" as any).select("id, title, description, icon, sort_order").eq("user_id", user.id).eq("is_active", true).order("sort_order");
        habitData = (newH ?? []) as any as Habit[];
        setSeeding(false);
      }

      setHabits(habitData);
      setCompletions((cRes.data ?? []) as any as Completion[]);
      setAllCompletions((allCRes.data ?? []) as any as Completion[]);
    };
    load();
  }, [user]);

  // Calculate streak
  useEffect(() => {
    if (habits.length === 0) { setStreak(0); return; }

    // Group completions by date
    const byDate: Record<string, Set<string>> = {};
    allCompletions.forEach((c) => {
      if (!byDate[c.completed_date]) byDate[c.completed_date] = new Set();
      byDate[c.completed_date].add(c.habit_id);
    });

    let s = 0;
    const today = new Date();
    // Check from yesterday backwards (today may be incomplete)
    const todayComplete = byDate[todayStr()]?.size === habits.length;
    const startOffset = todayComplete ? 0 : 1;

    for (let i = startOffset; ; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const ds = d.toISOString().split("T")[0];
      const completed = byDate[ds];
      if (completed && completed.size === habits.length) {
        s++;
      } else {
        break;
      }
    }
    if (todayComplete) setStreak(s);
    else setStreak(s);
  }, [allCompletions, habits]);

  const todayCompletedIds = new Set(completions.map((c) => c.habit_id));
  const completedCount = todayCompletedIds.size;
  const totalCount = habits.length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const toggleHabit = async (habitId: string) => {
    if (!user) return;
    const isCompleted = todayCompletedIds.has(habitId);

    if (isCompleted) {
      const comp = completions.find((c) => c.habit_id === habitId);
      if (comp) {
        await supabase.from("habit_completions" as any).delete().eq("id", comp.id);
        setCompletions((prev) => prev.filter((c) => c.id !== comp.id));
        setAllCompletions((prev) => prev.filter((c) => c.id !== comp.id));
      }
    } else {
      const { data, error } = await supabase.from("habit_completions" as any).insert({
        user_id: user.id, habit_id: habitId, completed_date: todayStr(),
      } as any).select("id, habit_id, completed_date").single();
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
        return;
      }
      const newComp = data as any as Completion;
      setCompletions((prev) => [...prev, newComp]);
      setAllCompletions((prev) => [newComp, ...prev]);
    }
  };

  const streakMilestones = [
    { days: 7, label: "7 Day", color: "text-amber-500", reached: streak >= 7 },
    { days: 14, label: "14 Day", color: "text-orange-500", reached: streak >= 14 },
    { days: 30, label: "30 Day", color: "text-red-500", reached: streak >= 30 },
  ];

  if (authLoading) return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground font-body">Loading…</p></div>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 container mx-auto px-4 max-w-3xl space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild><Link to="/dashboard"><ArrowLeft className="h-5 w-5" /></Link></Button>
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">Daily Habits</h1>
            <p className="text-muted-foreground font-body mt-1">Complete your daily scalp recovery routine.</p>
          </div>
        </div>

        {/* Progress + Streak Row */}
        <PremiumGate feature="Habit Tracker" blur>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Daily Progress */}
          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardDescription className="font-body text-xs uppercase tracking-wider">Today's Progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2 mb-3">
                <span className="text-4xl font-display font-bold text-primary">{progressPct}%</span>
                <span className="text-muted-foreground font-body text-sm mb-1">{completedCount}/{totalCount} tasks</span>
              </div>
              <Progress value={progressPct} className="h-3" />
              {progressPct === 100 && (
                <motion.p initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="text-sm font-body text-primary font-medium mt-2 flex items-center gap-1">
                  <Sparkles className="h-4 w-4" /> All tasks complete! Great work!
                </motion.p>
              )}
            </CardContent>
          </Card>

          {/* Streak */}
          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardDescription className="font-body text-xs uppercase tracking-wider">Current Streak</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2 mb-3">
                <Flame className="h-8 w-8 text-orange-500" />
                <span className="text-4xl font-display font-bold text-foreground">{streak}</span>
                <span className="text-muted-foreground font-body text-sm mb-1">day{streak !== 1 ? "s" : ""}</span>
              </div>
              <div className="flex gap-3">
                {streakMilestones.map((m) => (
                  <div key={m.days} className={`flex items-center gap-1 text-xs font-body ${m.reached ? m.color + " font-semibold" : "text-muted-foreground"}`}>
                    <Flame className="h-3 w-3" />
                    <span>{m.label}</span>
                    {m.reached && <span>✓</span>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Task Checklist */}
        <div className="space-y-3">
          <h2 className="font-display text-xl font-semibold text-foreground">Today's Tasks</h2>
          <AnimatePresence>
            {habits.map((habit, i) => {
              const done = todayCompletedIds.has(habit.id);
              return (
                <motion.div
                  key={habit.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card
                    className={`shadow-soft cursor-pointer transition-all duration-200 border-2 ${done ? "border-primary/30 bg-accent/30" : "border-transparent hover:border-primary/10"}`}
                    onClick={() => toggleHabit(habit.id)}
                  >
                    <CardContent className="flex items-start gap-4 p-4">
                      <div className="mt-0.5">
                        <Checkbox checked={done} onCheckedChange={() => toggleHabit(habit.id)} className="h-5 w-5" />
                      </div>
                      <div className={`flex-1 ${done ? "opacity-60" : ""}`}>
                        <div className="flex items-center gap-2">
                          <span className="text-primary">{ICON_MAP[habit.icon || ""] || <Sparkles className="h-5 w-5" />}</span>
                          <span className={`font-body font-medium ${done ? "line-through text-muted-foreground" : "text-foreground"}`}>{habit.title}</span>
                        </div>
                        {habit.description && (
                          <p className="text-xs text-muted-foreground font-body mt-1 ml-7">{habit.description}</p>
                        )}
                      </div>
                      {done && (
                        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-primary text-lg">✓</motion.span>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Completion History (last 7 days) */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-display text-lg">Last 7 Days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between gap-2">
              {Array.from({ length: 7 }).map((_, i) => {
                const d = new Date();
                d.setDate(d.getDate() - (6 - i));
                const ds = d.toISOString().split("T")[0];
                const dayCompletions = allCompletions.filter((c) => c.completed_date === ds);
                const pct = totalCount > 0 ? Math.round((dayCompletions.length / totalCount) * 100) : 0;
                const isToday = ds === todayStr();

                return (
                  <div key={ds} className="flex flex-col items-center gap-1 flex-1">
                    <div className="relative w-full max-w-[40px] h-24 bg-muted rounded-full overflow-hidden">
                      <div
                        className="absolute bottom-0 w-full rounded-full transition-all duration-500"
                        style={{
                          height: `${pct}%`,
                          backgroundColor: pct === 100 ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.4)",
                        }}
                      />
                    </div>
                    <span className={`text-xs font-body ${isToday ? "font-bold text-primary" : "text-muted-foreground"}`}>
                      {d.toLocaleDateString(undefined, { weekday: "short" }).slice(0, 2)}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HabitTracker;
