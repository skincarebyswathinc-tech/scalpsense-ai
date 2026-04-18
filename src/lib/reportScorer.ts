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

  // Generate issues from rules — supports both legacy string-conditions
  // and the structured rule format edited in the admin no-code builder.
  const ctx: Record<string, any> = d as any;
  const formatTemplate = (tpl: string, count: number) =>
    tpl.replace("{count}", String(count)).replace("{s}", count > 1 ? "s" : "");

  const evalStructured = (rule: any): string | null => {
    if (rule.active === false) return null;
    const col = rule.question;
    if (!col) return null;
    const fieldVal = ctx[col];
    const op = rule.operator;
    const target = rule.value;
    const matched = (() => {
      switch (op) {
        case "equals":
          return String(fieldVal) === String(target);
        case "not_equals":
          return String(fieldVal) !== String(target);
        case "greater_than":
          return Number(fieldVal) > Number(target);
        case "less_than":
          return Number(fieldVal) < Number(target);
        case "between": {
          const [min, max] = String(target).split(",").map(Number);
          return Number(fieldVal) >= min && Number(fieldVal) <= max;
        }
        case "contains":
          return Array.isArray(fieldVal)
            ? fieldVal.map(String).includes(String(target))
            : String(fieldVal ?? "").includes(String(target));
        case "count_gt":
          return Array.isArray(fieldVal) && fieldVal.length > Number(target);
        case "count_lt":
          return Array.isArray(fieldVal) && fieldVal.length < Number(target);
        default:
          return false;
      }
    })();
    if (!matched) return null;
    const tpl = rule.message || rule.template || "";
    if (Array.isArray(fieldVal) && (tpl.includes("{count}") || tpl.includes("{s}"))) {
      return formatTemplate(tpl, fieldVal.length);
    }
    return tpl || null;
  };

  const evalLegacy = (rule: any): string | null => {
    const cond = rule.condition;
    if (!cond) return null;
    if (cond === "symptoms_count > 0" && d.symptoms.length > 0) {
      return formatTemplate(rule.template || "", d.symptoms.length);
    }
    if (cond === "hair_changes_count > 0" && d.hair_changes.length > 0) {
      return formatTemplate(rule.template || "", d.hair_changes.length);
    }
    if (cond === `hair_shedding == ${d.hair_shedding}` && rule.message) return rule.message;
    if (cond === `stress_level == ${d.stress_level}` && rule.message) return rule.message;
    if (cond === `scalp_feel == ${d.scalp_feel}` && rule.message) return rule.message;
    if (cond === "sleep_hours < 6" && d.sleep_hours < 6 && rule.message) return rule.message;
    return null;
  };

  const rulesSorted = [...(scoring.issue_rules || [])].sort(
    (a: any, b: any) => (a.priority ?? 100) - (b.priority ?? 100),
  );
  const issues: string[] = [];
  for (const rule of rulesSorted as any[]) {
    const msg = rule.question ? evalStructured(rule) : evalLegacy(rule);
    if (msg) issues.push(msg);
  }

  const th = scoring.improvement_thresholds;
  const msgs = scoring.improvement_messages;
  const improvement = score < (th.critical || 40) ? (msgs.critical || "")
    : score < (th.moderate || 65) ? (msgs.moderate || "")
    : score < (th.good || 80) ? (msgs.good || "")
    : (msgs.excellent || "");

  return { score, scalpType, issues, improvement };
}
