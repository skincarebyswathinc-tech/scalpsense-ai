import { ScoringConfig } from "@/hooks/useQuizConfig";

interface AssessmentData {
  hair_shedding: string;
  scalp_feel: string;
  symptoms: string[];
  hair_changes: string[];
  stress_level: string;
  sleep_hours: number;
}

interface ReportResult {
  score: number;
  scalpType: string;
  issues: string[];
  improvement: string;
}

export function computeReportFromConfig(d: AssessmentData, scoring: ScoringConfig): ReportResult {
  const w = scoring.weights;
  const sheddingScore = scoring.shedding_scores[d.hair_shedding] ?? 50;
  const scalpScore = scoring.scalp_feel_scores[d.scalp_feel] ?? 50;
  const symptomPenalty = Math.min(d.symptoms.length * scoring.symptom_penalty_per_item, scoring.symptom_penalty_max);
  const changePenalty = Math.min(d.hair_changes.length * scoring.change_penalty_per_item, scoring.change_penalty_max);
  const stressScore = scoring.stress_scores[d.stress_level] ?? 50;

  const st = scoring.sleep_thresholds;
  const sleepScore = d.sleep_hours >= st.good ? st.good_score
    : d.sleep_hours >= st.moderate ? st.moderate_score : st.poor_score;

  const raw =
    sheddingScore * (w.shedding || 0.25) +
    scalpScore * (w.scalp_feel || 0.15) +
    (100 - symptomPenalty) * (w.symptoms || 0.20) +
    (100 - changePenalty) * (w.hair_changes || 0.15) +
    stressScore * (w.stress || 0.15) +
    sleepScore * (w.sleep || 0.10);

  const score = Math.round(Math.max(0, Math.min(100, raw)));
  const scalpType = scoring.scalp_feel_labels[d.scalp_feel] || "Unknown";

  // Generate issues from rules
  const issues: string[] = [];
  for (const rule of scoring.issue_rules || []) {
    if (rule.condition === "symptoms_count > 0" && d.symptoms.length > 0) {
      const t = rule.template || "";
      issues.push(t.replace("{count}", String(d.symptoms.length)).replace("{s}", d.symptoms.length > 1 ? "s" : ""));
    } else if (rule.condition === "hair_changes_count > 0" && d.hair_changes.length > 0) {
      const t = rule.template || "";
      issues.push(t.replace("{count}", String(d.hair_changes.length)).replace("{s}", d.hair_changes.length > 1 ? "s" : ""));
    } else if (rule.condition === `hair_shedding == ${d.hair_shedding}` && rule.message) {
      issues.push(rule.message);
    } else if (rule.condition === `stress_level == ${d.stress_level}` && rule.message) {
      issues.push(rule.message);
    } else if (rule.condition === `scalp_feel == ${d.scalp_feel}` && rule.message) {
      issues.push(rule.message);
    } else if (rule.condition === "sleep_hours < 6" && d.sleep_hours < 6 && rule.message) {
      issues.push(rule.message);
    }
  }

  const th = scoring.improvement_thresholds;
  const msgs = scoring.improvement_messages;
  const improvement = score < (th.critical || 40) ? (msgs.critical || "")
    : score < (th.moderate || 65) ? (msgs.moderate || "")
    : score < (th.good || 80) ? (msgs.good || "")
    : (msgs.excellent || "");

  return { score, scalpType, issues, improvement };
}
