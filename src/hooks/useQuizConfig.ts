import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface QuizOption {
  value: string;
  label: string;
}

export interface QuizField {
  key: string;
  label: string;
  type: "select" | "number" | "text";
  required: boolean;
  db_column: string;
  options?: QuizOption[];
  min?: number;
  max?: number;
}

export interface PhotoField {
  key: string;
  label: string;
  db_column: string;
}

export interface QuizStep {
  key: string;
  title: string;
  subtitle: string;
  type: "radio" | "checkbox" | "lifestyle_group" | "photo_upload";
  required: boolean;
  db_column?: string;
  options?: QuizOption[];
  fields?: (QuizField | PhotoField)[];
}

export interface ScoringConfig {
  weights: Record<string, number>;
  shedding_scores: Record<string, number>;
  scalp_feel_scores: Record<string, number>;
  scalp_feel_labels: Record<string, string>;
  stress_scores: Record<string, number>;
  symptom_penalty_per_item: number;
  symptom_penalty_max: number;
  change_penalty_per_item: number;
  change_penalty_max: number;
  sleep_thresholds: {
    good: number;
    good_score: number;
    moderate: number;
    moderate_score: number;
    poor_score: number;
  };
  improvement_messages: Record<string, string>;
  improvement_thresholds: Record<string, number>;
  issue_rules: Array<{
    condition: string;
    message?: string;
    template?: string;
  }>;
}

export interface QuizConfig {
  id: string;
  steps: QuizStep[];
  scoring: ScoringConfig;
  version: number;
}

async function fetchQuizConfig(): Promise<QuizConfig> {
  const { data, error } = await supabase
    .from("scalp_quiz_config" as any)
    .select("id, steps, scoring, version")
    .eq("config_key", "default")
    .eq("is_active", true)
    .single();

  if (error || !data) throw new Error("Failed to load quiz configuration");
  const d = data as any;
  return {
    id: d.id,
    steps: d.steps as QuizStep[],
    scoring: d.scoring as ScoringConfig,
    version: d.version,
  };
}

export function useQuizConfig() {
  return useQuery({
    queryKey: ["scalp-quiz-config"],
    queryFn: fetchQuizConfig,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}
