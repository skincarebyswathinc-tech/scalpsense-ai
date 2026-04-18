import { ScoringConfig, QuizStep } from "@/hooks/useQuizConfig";

interface AssessmentData {
  hair_shedding: string;
  scalp_feel: string;
  symptoms: string[];
  hair_changes: string[];
  stress_level: string;
  sleep_hours: number;
  [key: string]: any;
}

interface ReportResult {
  score: number;
  scalpType: string;
  issues: string[];
  improvement: string;
  /** Per-factor contribution to the final score, for transparency in the report */
  breakdown?: { key: string; label: string; weight: number; raw: number; contribution: number }[];
}

/**
 * Compute the scalp report from the user's assessment + admin-controlled
 * scoring config. Per-step `weight` values configured in the admin Quiz
 * editor are honoured: each question's score is multiplied by its weight
 * and the final score is the weighted average normalised to 0–100.
 *
 * Falls back to the legacy `scoring.weights` map when no per-step weight
 * is configured, so existing configs keep working unchanged.
 */
export function computeReportFromConfig(
  d: AssessmentData,
  scoring: ScoringConfig,
  steps?: QuizStep[],
): ReportResult {
  const w = scoring.weights || {};
  const sheddingScore = scoring.shedding_scores[d.hair_shedding] ?? 50;
  const scalpScore = scoring.scalp_feel_scores[d.scalp_feel] ?? 50;
  const symptomPenalty = Math.min((d.symptoms?.length || 0) * scoring.symptom_penalty_per_item, scoring.symptom_penalty_max);
  const changePenalty = Math.min((d.hair_changes?.length || 0) * scoring.change_penalty_per_item, scoring.change_penalty_max);
  const stressScore = scoring.stress_scores[d.stress_level] ?? 50;

  const st = scoring.sleep_thresholds;
  const sleepScore = d.sleep_hours >= st.good ? st.good_score
    : d.sleep_hours >= st.moderate ? st.moderate_score : st.poor_score;

  // ── Build the list of scoring factors. Per-step weights from the admin
  // ── editor (steps[i].weight) take precedence over the legacy weights map.
  const stepWeight = (col: string): number | undefined => {
    if (!steps) return undefined;
    const s = steps.find(
      (st) => st.db_column === col || (st.fields || []).some((f: any) => f.db_column === col),
    );
    const wv = s?.weight;
    return typeof wv === "number" && wv > 0 ? wv : undefined;
  };

  const factors = [
    { key: "hair_shedding",  label: "Shedding",     raw: sheddingScore,         weight: stepWeight("hair_shedding")  ?? (w.shedding     || 0.25) },
    { key: "scalp_feel",     label: "Scalp Feel",   raw: scalpScore,            weight: stepWeight("scalp_feel")     ?? (w.scalp_feel   || 0.15) },
    { key: "symptoms",       label: "Symptoms",     raw: 100 - symptomPenalty,  weight: stepWeight("symptoms")       ?? (w.symptoms     || 0.20) },
    { key: "hair_changes",   label: "Hair Changes", raw: 100 - changePenalty,   weight: stepWeight("hair_changes")   ?? (w.hair_changes || 0.15) },
    { key: "stress_level",   label: "Stress",       raw: stressScore,           weight: stepWeight("stress_level")   ?? (w.stress       || 0.15) },
    { key: "sleep_hours",    label: "Sleep",        raw: sleepScore,            weight: stepWeight("sleep_hours")    ?? (w.sleep        || 0.10) },
  ];

  // Include any extra admin-defined questions whose weight > 0 and whose
  // value can be looked up in the answer payload. Numeric answers are
  // taken as-is (clamped 0-100), other answer types are scored via the
  // shedding/scalp_feel/stress maps as a best-effort default of 50.
  if (steps) {
    const known = new Set(factors.map((f) => f.key));
    steps.forEach((s) => {
      const col = s.db_column;
      if (!col || known.has(col)) return;
      const ww = typeof s.weight === "number" ? s.weight : 0;
      if (ww <= 0) return;
      const v = (d as any)[col];
      let raw = 50;
      if (typeof v === "number") raw = Math.max(0, Math.min(100, v));
      else if (Array.isArray(v)) raw = Math.max(0, 100 - v.length * 10);
      factors.push({ key: col, label: s.title || col, raw, weight: ww });
    });
  }

  const totalWeight = factors.reduce((sum, f) => sum + f.weight, 0) || 1;
  const weightedSum = factors.reduce((sum, f) => sum + f.raw * f.weight, 0);
  const raw = weightedSum / totalWeight;

  const score = Math.round(Math.max(0, Math.min(100, raw)));
  const scalpType = scoring.scalp_feel_labels[d.scalp_feel] || "Unknown";

  const breakdown = factors.map((f) => ({
    key: f.key,
    label: f.label,
    weight: Math.round((f.weight / totalWeight) * 100) / 100,
    raw: Math.round(f.raw),
    contribution: Math.round((f.raw * f.weight) / totalWeight),
  }));

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

  return { score, scalpType, issues, improvement, breakdown };
}
