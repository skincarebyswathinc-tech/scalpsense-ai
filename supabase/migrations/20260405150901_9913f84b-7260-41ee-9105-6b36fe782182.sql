
-- Scalp quiz configuration table: admin-driven quiz structure and scoring
CREATE TABLE public.scalp_quiz_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key text UNIQUE NOT NULL DEFAULT 'default',
  steps jsonb NOT NULL DEFAULT '[]'::jsonb,
  scoring jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  version integer NOT NULL DEFAULT 1,
  updated_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.scalp_quiz_config ENABLE ROW LEVEL SECURITY;

-- Anyone can read active config
CREATE POLICY "Anyone can read active quiz config"
  ON public.scalp_quiz_config FOR SELECT TO public
  USING (is_active = true);

-- Admins can manage config
CREATE POLICY "Admins can manage quiz config"
  ON public.scalp_quiz_config FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- Seed with current hardcoded quiz structure
INSERT INTO public.scalp_quiz_config (config_key, steps, scoring) VALUES (
  'default',
  '[
    {
      "key": "hairShedding",
      "title": "Hair Shedding",
      "subtitle": "How many hairs do you shed per day on average?",
      "type": "radio",
      "required": true,
      "db_column": "hair_shedding",
      "options": [
        {"value": "less_than_50", "label": "Less than 50"},
        {"value": "50_100", "label": "50–100"},
        {"value": "100_150", "label": "100–150"},
        {"value": "150_plus", "label": "150+"}
      ]
    },
    {
      "key": "scalpFeel",
      "title": "Scalp Feel",
      "subtitle": "How does your scalp feel 24 hours after washing?",
      "type": "radio",
      "required": true,
      "db_column": "scalp_feel",
      "options": [
        {"value": "dry", "label": "Dry"},
        {"value": "balanced", "label": "Balanced"},
        {"value": "slightly_oily", "label": "Slightly Oily"},
        {"value": "very_oily", "label": "Very Oily"}
      ]
    },
    {
      "key": "symptoms",
      "title": "Symptoms",
      "subtitle": "Select all that apply (optional)",
      "type": "checkbox",
      "required": false,
      "db_column": "symptoms",
      "options": [
        {"value": "White flakes", "label": "White flakes"},
        {"value": "Yellow flakes", "label": "Yellow flakes"},
        {"value": "Itch", "label": "Itch"},
        {"value": "Redness", "label": "Redness"},
        {"value": "Scalp pimples", "label": "Scalp pimples"},
        {"value": "Burning sensation", "label": "Burning sensation"}
      ]
    },
    {
      "key": "hairChanges",
      "title": "Hair Changes",
      "subtitle": "Select all that apply (optional)",
      "type": "checkbox",
      "required": false,
      "db_column": "hair_changes",
      "options": [
        {"value": "Thinning hairline", "label": "Thinning hairline"},
        {"value": "Widening part line", "label": "Widening part line"},
        {"value": "Reduced ponytail thickness", "label": "Reduced ponytail thickness"},
        {"value": "Sudden hair fall", "label": "Sudden hair fall"}
      ]
    },
    {
      "key": "lifestyle",
      "title": "Lifestyle",
      "subtitle": "Tell us about your daily habits",
      "type": "lifestyle_group",
      "required": true,
      "fields": [
        {
          "key": "stressLevel",
          "label": "Stress Level",
          "type": "select",
          "required": true,
          "db_column": "stress_level",
          "options": [
            {"value": "low", "label": "Low"},
            {"value": "medium", "label": "Medium"},
            {"value": "high", "label": "High"}
          ]
        },
        {
          "key": "sleepHours",
          "label": "Sleep Hours per Night",
          "type": "number",
          "required": true,
          "db_column": "sleep_hours",
          "min": 1,
          "max": 16
        },
        {
          "key": "proteinIntake",
          "label": "Protein Intake",
          "type": "select",
          "required": false,
          "db_column": "protein_intake",
          "options": [
            {"value": "low", "label": "Low"},
            {"value": "moderate", "label": "Moderate"},
            {"value": "high", "label": "High"}
          ]
        },
        {
          "key": "hairStylingFrequency",
          "label": "Hair Styling Frequency",
          "type": "select",
          "required": false,
          "db_column": "hair_styling_frequency",
          "options": [
            {"value": "rarely", "label": "Rarely"},
            {"value": "weekly", "label": "Weekly"},
            {"value": "daily", "label": "Daily"}
          ]
        },
        {
          "key": "hairColoringTreatments",
          "label": "Hair Coloring / Treatments",
          "type": "select",
          "required": false,
          "db_column": "hair_coloring_treatments",
          "options": [
            {"value": "never", "label": "Never"},
            {"value": "occasionally", "label": "Occasionally"},
            {"value": "frequently", "label": "Frequently"}
          ]
        }
      ]
    },
    {
      "key": "photos",
      "title": "Photo Upload",
      "subtitle": "Optional — helps us give a more accurate assessment",
      "type": "photo_upload",
      "required": false,
      "fields": [
        {"key": "photoFrontScalp", "label": "Front Scalp", "db_column": "photo_front_scalp"},
        {"key": "photoTopScalp", "label": "Top Scalp", "db_column": "photo_top_scalp"},
        {"key": "photoCrown", "label": "Crown", "db_column": "photo_crown"}
      ]
    }
  ]'::jsonb,
  '{
    "weights": {
      "shedding": 0.25,
      "scalp_feel": 0.15,
      "symptoms": 0.20,
      "hair_changes": 0.15,
      "stress": 0.15,
      "sleep": 0.10
    },
    "shedding_scores": {
      "less_than_50": 90,
      "50_100": 70,
      "100_150": 45,
      "150_plus": 20
    },
    "scalp_feel_scores": {
      "dry": 55,
      "balanced": 95,
      "slightly_oily": 70,
      "very_oily": 40
    },
    "scalp_feel_labels": {
      "dry": "Dry Scalp",
      "balanced": "Balanced",
      "slightly_oily": "Slightly Oily",
      "very_oily": "Very Oily"
    },
    "stress_scores": {
      "low": 90,
      "medium": 60,
      "high": 30
    },
    "symptom_penalty_per_item": 8,
    "symptom_penalty_max": 40,
    "change_penalty_per_item": 10,
    "change_penalty_max": 40,
    "sleep_thresholds": {
      "good": 7,
      "good_score": 90,
      "moderate": 5,
      "moderate_score": 60,
      "poor_score": 30
    },
    "improvement_messages": {
      "critical": "High — significant improvement possible with the right protocol",
      "moderate": "Moderate — targeted intervention can boost your score 20-30%",
      "good": "Good — fine-tuning your routine can push you to excellent",
      "excellent": "Excellent — maintain your routine for lasting results"
    },
    "improvement_thresholds": {
      "critical": 40,
      "moderate": 65,
      "good": 80
    },
    "issue_rules": [
      {"condition": "symptoms_count > 0", "template": "{count} scalp symptom{s} detected"},
      {"condition": "hair_changes_count > 0", "template": "{count} hair change pattern{s}"},
      {"condition": "hair_shedding == 150_plus", "message": "Heavy hair shedding (150+ strands/day)"},
      {"condition": "hair_shedding == 100_150", "message": "Moderate shedding (100-150 strands/day)"},
      {"condition": "stress_level == high", "message": "High stress levels affecting scalp"},
      {"condition": "sleep_hours < 6", "message": "Insufficient sleep impacting recovery"},
      {"condition": "scalp_feel == very_oily", "message": "Excess oil may clog follicles"},
      {"condition": "scalp_feel == dry", "message": "Dry scalp may cause irritation"}
    ]
  }'::jsonb
);
