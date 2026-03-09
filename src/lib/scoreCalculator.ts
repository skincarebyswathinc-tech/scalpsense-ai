import { supabase } from "@/integrations/supabase/client";

interface ScoreBreakdown {
  score: number;
  habit_score: number;
  hairfall_score: number;
  symptom_score: number;
  protocol_score: number;
  photo_score: number;
}

/**
 * Calculate and upsert the Scalp Recovery Score for the current week.
 * Score = weighted average of 5 components, each 0-20:
 *   - Habit completion rate (30%)
 *   - Hair fall reduction (20%)
 *   - Symptom reduction (20%)
 *   - Protocol adherence (15%)
 *   - Weekly photo uploads (15%)
 */
export async function calculateAndSaveScore(userId: string, weekNumber: number): Promise<ScoreBreakdown> {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - 7);
  const weekStartStr = weekStart.toISOString();
  const prevWeekStart = new Date(weekStart);
  prevWeekStart.setDate(prevWeekStart.getDate() - 7);
  const prevWeekStartStr = prevWeekStart.toISOString();

  // Fetch data in parallel
  const [habitsRes, completionsRes, hairLogsRes, prevHairLogsRes, symptomLogsRes, prevSymptomLogsRes, tasksRes, photosRes] = await Promise.all([
    supabase.from("daily_habits" as any).select("id").eq("user_id", userId).eq("is_active", true),
    supabase.from("habit_completions" as any).select("id, completed_date").eq("user_id", userId).gte("completed_date", weekStart.toISOString().split("T")[0]),
    supabase.from("hair_fall_logs").select("count").eq("user_id", userId).gte("logged_at", weekStartStr),
    supabase.from("hair_fall_logs").select("count").eq("user_id", userId).gte("logged_at", prevWeekStartStr).lt("logged_at", weekStartStr),
    supabase.from("symptom_logs" as any).select("severity").eq("user_id", userId).gte("logged_at", weekStartStr),
    supabase.from("symptom_logs" as any).select("severity").eq("user_id", userId).gte("logged_at", prevWeekStartStr).lt("logged_at", weekStartStr),
    supabase.from("routine_tasks").select("id, is_completed").eq("user_id", userId).eq("week_number", weekNumber),
    supabase.from("scalp_progress_photos" as any).select("id").eq("user_id", userId).eq("week_number", weekNumber),
  ]);

  const habits = (habitsRes.data ?? []) as any[];
  const completions = (completionsRes.data ?? []) as any[];
  const hairLogs = (hairLogsRes.data ?? []) as any[];
  const prevHairLogs = (prevHairLogsRes.data ?? []) as any[];
  const symptomLogs = (symptomLogsRes.data ?? []) as any[];
  const prevSymptomLogs = (prevSymptomLogsRes.data ?? []) as any[];
  const tasks = (tasksRes.data ?? []) as any[];
  const photos = (photosRes.data ?? []) as any[];

  // 1. Habit completion rate (0-20)
  let habitScore = 0;
  if (habits.length > 0) {
    // Possible completions = habits * 7 days
    const maxCompletions = habits.length * 7;
    const completionRate = Math.min(completions.length / maxCompletions, 1);
    habitScore = Math.round(completionRate * 20);
  }

  // 2. Hair fall reduction (0-20) — compare avg to previous week
  let hairfallScore = 10; // baseline
  const currAvg = hairLogs.length > 0 ? hairLogs.reduce((s: number, l: any) => s + l.count, 0) / hairLogs.length : null;
  const prevAvg = prevHairLogs.length > 0 ? prevHairLogs.reduce((s: number, l: any) => s + l.count, 0) / prevHairLogs.length : null;
  if (currAvg !== null && prevAvg !== null && prevAvg > 0) {
    const reduction = (prevAvg - currAvg) / prevAvg;
    hairfallScore = Math.round(Math.min(Math.max(10 + reduction * 20, 0), 20));
  } else if (currAvg !== null && currAvg < 50) {
    hairfallScore = 15;
  } else if (currAvg !== null) {
    hairfallScore = Math.round(Math.max(20 - (currAvg / 10), 0));
  }

  // 3. Symptom reduction (0-20)
  let symptomScore = 10;
  const currSymAvg = symptomLogs.length > 0 ? symptomLogs.reduce((s: number, l: any) => s + l.severity, 0) / symptomLogs.length : null;
  const prevSymAvg = prevSymptomLogs.length > 0 ? prevSymptomLogs.reduce((s: number, l: any) => s + l.severity, 0) / prevSymptomLogs.length : null;
  if (currSymAvg !== null && prevSymAvg !== null && prevSymAvg > 0) {
    const improvement = (prevSymAvg - currSymAvg) / prevSymAvg;
    symptomScore = Math.round(Math.min(Math.max(10 + improvement * 20, 0), 20));
  } else if (currSymAvg !== null) {
    symptomScore = Math.round(Math.max(20 - currSymAvg * 3, 0));
  }

  // 4. Protocol adherence (0-20)
  let protocolScore = 0;
  if (tasks.length > 0) {
    const completed = tasks.filter((t: any) => t.is_completed).length;
    protocolScore = Math.round((completed / tasks.length) * 20);
  }

  // 5. Photo uploads (0-20) — at least 1 photo this week = full score
  const photoScore = photos.length > 0 ? 20 : 0;

  // Weighted total
  const score = Math.round(
    habitScore * 1.5 +     // 30% of 100
    hairfallScore * 1.0 +  // 20%
    symptomScore * 1.0 +   // 20%
    protocolScore * 0.75 + // 15%
    photoScore * 0.75      // 15%
  );

  const clampedScore = Math.min(Math.max(score, 0), 100);

  const breakdown: ScoreBreakdown = {
    score: clampedScore,
    habit_score: habitScore,
    hairfall_score: hairfallScore,
    symptom_score: symptomScore,
    protocol_score: protocolScore,
    photo_score: photoScore,
  };

  // Upsert score
  const { error } = await supabase.from("scalp_recovery_scores" as any).upsert({
    user_id: userId,
    week_number: weekNumber,
    ...breakdown,
    calculated_at: new Date().toISOString(),
  } as any, { onConflict: "user_id,week_number" });

  if (error) console.error("Score save error:", error);

  return breakdown;
}

export interface WeeklyScore {
  week_number: number;
  score: number;
  habit_score: number;
  hairfall_score: number;
  symptom_score: number;
  protocol_score: number;
  photo_score: number;
  calculated_at: string;
}

export async function fetchAllScores(userId: string): Promise<WeeklyScore[]> {
  const { data } = await supabase
    .from("scalp_recovery_scores" as any)
    .select("week_number, score, habit_score, hairfall_score, symptom_score, protocol_score, photo_score, calculated_at")
    .eq("user_id", userId)
    .order("week_number");
  return (data ?? []) as any as WeeklyScore[];
}
