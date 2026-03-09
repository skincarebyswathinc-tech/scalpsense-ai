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
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
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
      scalp_feel: ["dry", "balanced", "slightly_oily", "very_oily"],
      shedding_level: ["less_than_50", "50_100", "100_150", "150_plus"],
      stress_level: ["low", "medium", "high"],
    },
  },
} as const
