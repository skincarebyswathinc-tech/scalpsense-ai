export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      daily_habits: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_active: boolean
          sort_order: number
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          sort_order?: number
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          sort_order?: number
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      faqs: {
        Row: {
          answer: string
          created_at: string
          id: string
          is_active: boolean
          question: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          answer: string
          created_at?: string
          id?: string
          is_active?: boolean
          question: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          answer?: string
          created_at?: string
          id?: string
          is_active?: boolean
          question?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      habit_completions: {
        Row: {
          completed_at: string
          completed_date: string
          habit_id: string
          id: string
          user_id: string
        }
        Insert: {
          completed_at?: string
          completed_date?: string
          habit_id: string
          id?: string
          user_id: string
        }
        Update: {
          completed_at?: string
          completed_date?: string
          habit_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "habit_completions_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "daily_habits"
            referencedColumns: ["id"]
          },
        ]
      }
      hair_fall_logs: {
        Row: {
          count: number
          id: string
          logged_at: string
          user_id: string
        }
        Insert: {
          count: number
          id?: string
          logged_at?: string
          user_id: string
        }
        Update: {
          count?: number
          id?: string
          logged_at?: string
          user_id?: string
        }
        Relationships: []
      }
      kit_products: {
        Row: {
          id: string
          kit_id: string
          product_id: string
          sort_order: number
        }
        Insert: {
          id?: string
          kit_id: string
          product_id: string
          sort_order?: number
        }
        Update: {
          id?: string
          kit_id?: string
          product_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "kit_products_kit_id_fkey"
            columns: ["kit_id"]
            isOneToOne: false
            referencedRelation: "product_kits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kit_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string | null
          session_id: string | null
          source: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name?: string | null
          session_id?: string | null
          source?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string | null
          session_id?: string | null
          source?: string | null
        }
        Relationships: []
      }
      product_clicks: {
        Row: {
          click_type: string
          created_at: string
          id: string
          product_id: string
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          click_type?: string
          created_at?: string
          id?: string
          product_id: string
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          click_type?: string
          created_at?: string
          id?: string
          product_id?: string
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_clicks_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_kits: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          price_amount: number | null
          price_display: string | null
          routine_plan: string | null
          slug: string
          sort_order: number
          tagline: string | null
          target_scalp_types: string[] | null
          target_symptoms: string[] | null
          usage_guide: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          price_amount?: number | null
          price_display?: string | null
          routine_plan?: string | null
          slug: string
          sort_order?: number
          tagline?: string | null
          target_scalp_types?: string[] | null
          target_symptoms?: string[] | null
          usage_guide?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          price_amount?: number | null
          price_display?: string | null
          routine_plan?: string | null
          slug?: string
          sort_order?: number
          tagline?: string | null
          target_scalp_types?: string[] | null
          target_symptoms?: string[] | null
          usage_guide?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          brand: string | null
          category: string
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          payment_link: string | null
          price_display: string | null
          product_type: string
          purchase_url: string | null
          quantity: number | null
          sort_order: number
          target_scalp_types: string[] | null
          target_symptoms: string[] | null
          tier: string
          updated_at: string
        }
        Insert: {
          brand?: string | null
          category: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          payment_link?: string | null
          price_display?: string | null
          product_type?: string
          purchase_url?: string | null
          quantity?: number | null
          sort_order?: number
          target_scalp_types?: string[] | null
          target_symptoms?: string[] | null
          tier: string
          updated_at?: string
        }
        Update: {
          brand?: string | null
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          payment_link?: string | null
          price_display?: string | null
          product_type?: string
          purchase_url?: string | null
          quantity?: number | null
          sort_order?: number
          target_scalp_types?: string[] | null
          target_symptoms?: string[] | null
          tier?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          deactivated_at: string | null
          display_name: string | null
          id: string
          is_active: boolean
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          deactivated_at?: string | null
          display_name?: string | null
          id: string
          is_active?: boolean
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          deactivated_at?: string | null
          display_name?: string | null
          id?: string
          is_active?: boolean
        }
        Relationships: []
      }
      quiz_questions: {
        Row: {
          correct_answer: string
          created_at: string
          explanation: string | null
          id: string
          options: Json
          question_text: string
          quiz_id: string
          sort_order: number
        }
        Insert: {
          correct_answer: string
          created_at?: string
          explanation?: string | null
          id?: string
          options?: Json
          question_text: string
          quiz_id: string
          sort_order?: number
        }
        Update: {
          correct_answer?: string
          created_at?: string
          explanation?: string | null
          id?: string
          options?: Json
          question_text?: string
          quiz_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quizzes: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          difficulty: string
          id: string
          is_active: boolean
          title: string
          topic: string | null
          updated_at: string
          version: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          difficulty?: string
          id?: string
          is_active?: boolean
          title: string
          topic?: string | null
          updated_at?: string
          version?: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          difficulty?: string
          id?: string
          is_active?: boolean
          title?: string
          topic?: string | null
          updated_at?: string
          version?: number
        }
        Relationships: []
      }
      referral_conversions: {
        Row: {
          created_at: string
          id: string
          referral_code: string
          referred_user_id: string
          referrer_user_id: string
          reward_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          referral_code: string
          referred_user_id: string
          referrer_user_id: string
          reward_type?: string
        }
        Update: {
          created_at?: string
          id?: string
          referral_code?: string
          referred_user_id?: string
          referrer_user_id?: string
          reward_type?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          clicks: number
          conversions: number
          created_at: string
          id: string
          referral_code: string
          referrer_session_id: string
          reward_applied: boolean
          reward_days_earned: number
          user_id: string | null
        }
        Insert: {
          clicks?: number
          conversions?: number
          created_at?: string
          id?: string
          referral_code: string
          referrer_session_id: string
          reward_applied?: boolean
          reward_days_earned?: number
          user_id?: string | null
        }
        Update: {
          clicks?: number
          conversions?: number
          created_at?: string
          id?: string
          referral_code?: string
          referrer_session_id?: string
          reward_applied?: boolean
          reward_days_earned?: number
          user_id?: string | null
        }
        Relationships: []
      }
      routine_tasks: {
        Row: {
          completed_at: string | null
          created_at: string
          day_of_week: number | null
          description: string | null
          id: string
          is_completed: boolean
          title: string
          user_id: string
          week_number: number
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          day_of_week?: number | null
          description?: string | null
          id?: string
          is_completed?: boolean
          title: string
          user_id: string
          week_number?: number
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          day_of_week?: number | null
          description?: string | null
          id?: string
          is_completed?: boolean
          title?: string
          user_id?: string
          week_number?: number
        }
        Relationships: []
      }
      scalp_assessments: {
        Row: {
          created_at: string
          exercise_habits: string | null
          hair_changes: string[] | null
          hair_coloring_treatments: string | null
          hair_shedding: Database["public"]["Enums"]["shedding_level"]
          hair_styling_frequency: string | null
          id: string
          photo_crown: string | null
          photo_front_scalp: string | null
          photo_top_scalp: string | null
          protein_intake: string | null
          scalp_feel: Database["public"]["Enums"]["scalp_feel"]
          session_id: string
          sleep_hours: number
          stress_level: Database["public"]["Enums"]["stress_level"]
          symptoms: string[] | null
        }
        Insert: {
          created_at?: string
          exercise_habits?: string | null
          hair_changes?: string[] | null
          hair_coloring_treatments?: string | null
          hair_shedding: Database["public"]["Enums"]["shedding_level"]
          hair_styling_frequency?: string | null
          id?: string
          photo_crown?: string | null
          photo_front_scalp?: string | null
          photo_top_scalp?: string | null
          protein_intake?: string | null
          scalp_feel: Database["public"]["Enums"]["scalp_feel"]
          session_id?: string
          sleep_hours: number
          stress_level: Database["public"]["Enums"]["stress_level"]
          symptoms?: string[] | null
        }
        Update: {
          created_at?: string
          exercise_habits?: string | null
          hair_changes?: string[] | null
          hair_coloring_treatments?: string | null
          hair_shedding?: Database["public"]["Enums"]["shedding_level"]
          hair_styling_frequency?: string | null
          id?: string
          photo_crown?: string | null
          photo_front_scalp?: string | null
          photo_top_scalp?: string | null
          protein_intake?: string | null
          scalp_feel?: Database["public"]["Enums"]["scalp_feel"]
          session_id?: string
          sleep_hours?: number
          stress_level?: Database["public"]["Enums"]["stress_level"]
          symptoms?: string[] | null
        }
        Relationships: []
      }
      scalp_progress_photos: {
        Row: {
          hair_fall_level: string | null
          id: string
          notes: string | null
          photo_type: string
          photo_url: string
          scalp_score: number | null
          uploaded_at: string
          user_id: string
          week_number: number
        }
        Insert: {
          hair_fall_level?: string | null
          id?: string
          notes?: string | null
          photo_type?: string
          photo_url: string
          scalp_score?: number | null
          uploaded_at?: string
          user_id: string
          week_number?: number
        }
        Update: {
          hair_fall_level?: string | null
          id?: string
          notes?: string | null
          photo_type?: string
          photo_url?: string
          scalp_score?: number | null
          uploaded_at?: string
          user_id?: string
          week_number?: number
        }
        Relationships: []
      }
      scalp_quiz_config: {
        Row: {
          config_key: string
          created_at: string
          id: string
          is_active: boolean
          scoring: Json
          steps: Json
          updated_at: string
          updated_by: string | null
          version: number
        }
        Insert: {
          config_key?: string
          created_at?: string
          id?: string
          is_active?: boolean
          scoring?: Json
          steps?: Json
          updated_at?: string
          updated_by?: string | null
          version?: number
        }
        Update: {
          config_key?: string
          created_at?: string
          id?: string
          is_active?: boolean
          scoring?: Json
          steps?: Json
          updated_at?: string
          updated_by?: string | null
          version?: number
        }
        Relationships: []
      }
      scalp_recovery_scores: {
        Row: {
          calculated_at: string
          habit_score: number
          hairfall_score: number
          id: string
          message: string | null
          photo_score: number
          protocol_score: number
          score: number
          symptom_score: number
          user_id: string
          week_number: number
        }
        Insert: {
          calculated_at?: string
          habit_score?: number
          hairfall_score?: number
          id?: string
          message?: string | null
          photo_score?: number
          protocol_score?: number
          score?: number
          symptom_score?: number
          user_id: string
          week_number: number
        }
        Update: {
          calculated_at?: string
          habit_score?: number
          hairfall_score?: number
          id?: string
          message?: string | null
          photo_score?: number
          protocol_score?: number
          score?: number
          symptom_score?: number
          user_id?: string
          week_number?: number
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          payment_id: string | null
          payment_provider: string | null
          plan: string
          started_at: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          payment_id?: string | null
          payment_provider?: string | null
          plan?: string
          started_at?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          payment_id?: string | null
          payment_provider?: string | null
          plan?: string
          started_at?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      symptom_logs: {
        Row: {
          id: string
          logged_at: string
          notes: string | null
          severity: number
          symptoms: string[]
          user_id: string
        }
        Insert: {
          id?: string
          logged_at?: string
          notes?: string | null
          severity?: number
          symptoms?: string[]
          user_id: string
        }
        Update: {
          id?: string
          logged_at?: string
          notes?: string | null
          severity?: number
          symptoms?: string[]
          user_id?: string
        }
        Relationships: []
      }
      user_reports: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          recovery_week: number
          scalp_score: number
          session_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          recovery_week?: number
          scalp_score?: number
          session_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          recovery_week?: number
          scalp_score?: number
          session_id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_reviews: {
        Row: {
          created_at: string
          id: string
          is_approved: boolean
          rating: number
          result_highlight: string | null
          review_text: string
          user_id: string | null
          user_name: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_approved?: boolean
          rating?: number
          result_highlight?: string | null
          review_text: string
          user_id?: string | null
          user_name?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_approved?: boolean
          rating?: number
          result_highlight?: string | null
          review_text?: string
          user_id?: string | null
          user_name?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      scalp_feel: "dry" | "balanced" | "slightly_oily" | "very_oily"
      shedding_level: "less_than_50" | "50_100" | "100_150" | "150_plus"
      stress_level: "low" | "medium" | "high"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
      scalp_feel: ["dry", "balanced", "slightly_oily", "very_oily"],
      shedding_level: ["less_than_50", "50_100", "100_150", "150_plus"],
      stress_level: ["low", "medium", "high"],
    },
  },
} as const
