import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame, Sparkles } from "lucide-react";
import { InfoTip } from "@/components/ui/info-tip";

/**
 * Calculates the user's habit-completion streak (consecutive days they
 * completed at least one habit, ending today or yesterday).
 *
 * Encourages daily consistency — a key driver of the Recovery Score.
 */
const StreakCard = () => {
  const { user } = useAuth();
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [todayDone, setTodayDone] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      // Pull last 90 days of completions
      const since = new Date();
      since.setDate(since.getDate() - 90);
      const { data } = await supabase
        .from("habit_completions")
        .select("completed_date")
        .eq("user_id", user.id)
        .gte("completed_date", since.toISOString().slice(0, 10))
        .order("completed_date", { ascending: false });

      const dateSet = new Set<string>((data || []).map((d: any) => d.completed_date));
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString().slice(0, 10);
      const yest = new Date(today); yest.setDate(yest.getDate() - 1);
      const yestStr = yest.toISOString().slice(0, 10);

      setTodayDone(dateSet.has(todayStr));

      // Walk back from today (or yesterday if today not yet complete)
      let cursor = dateSet.has(todayStr) ? today : (dateSet.has(yestStr) ? yest : null);
      let cur = 0;
      while (cursor) {
        const k = cursor.toISOString().slice(0, 10);
        if (dateSet.has(k)) {
          cur++;
          cursor.setDate(cursor.getDate() - 1);
        } else break;
      }
      setCurrentStreak(cur);

      // Longest in window
      const sortedDates = Array.from(dateSet).sort();
      let longest = 0, run = 0, prev: Date | null = null;
      for (const ds of sortedDates) {
        const d = new Date(ds);
        if (prev && (d.getTime() - prev.getTime()) === 86400000) {
          run++;
        } else {
          run = 1;
        }
        longest = Math.max(longest, run);
        prev = d;
      }
      setLongestStreak(longest);
      setLoading(false);
    })();
  }, [user]);

  const message = (() => {
    if (loading) return "Loading…";
    if (currentStreak === 0) return "Start your streak today — complete one habit to begin.";
    if (currentStreak < 3) return `Great start! ${3 - currentStreak} more day${3 - currentStreak === 1 ? "" : "s"} to hit a 3-day streak.`;
    if (currentStreak < 7) return `You're on fire! Push for a full 7-day week 🔥`;
    if (currentStreak < 21) return `${currentStreak} days strong — habits are forming. Keep going!`;
    return `Legendary ${currentStreak}-day streak. Your scalp is thanking you.`;
  })();

  return (
    <Card className="shadow-card border-primary/20 bg-gradient-to-br from-card to-accent/10">
      <CardHeader className="pb-2">
        <CardTitle className="font-display text-lg flex items-center gap-2">
          <Flame className="h-5 w-5 text-primary" />
          Habit Streak
          <InfoTip>
            Number of consecutive days you've completed at least one habit.
            Streaks build neural reward loops — the longer you keep it, the
            more automatic your recovery routine becomes.
          </InfoTip>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-4">
          <div>
            <p className="font-display text-4xl font-bold text-foreground">
              {currentStreak}
              <span className="text-base text-muted-foreground ml-1">days</span>
            </p>
            <p className="text-xs text-muted-foreground font-body mt-1">Current streak</p>
          </div>
          <div className="border-l pl-4">
            <p className="font-display text-2xl font-bold text-foreground">{longestStreak}</p>
            <p className="text-xs text-muted-foreground font-body">Best (90d)</p>
          </div>
        </div>
        <p className="text-sm font-body text-foreground mt-3 flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          {message}
        </p>
        {!todayDone && currentStreak > 0 && (
          <p className="text-xs text-destructive font-body mt-2">
            ⏰ Complete a habit today to keep your streak alive!
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default StreakCard;
