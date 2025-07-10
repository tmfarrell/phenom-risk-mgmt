export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      patient: {
        Row: {
          age: number | null
          dob: string | null
          gender: string | null
          last_visit: string | null
          mrn: number | null
          name: string | null
          patient_id: number
        }
        Insert: {
          age?: number | null
          dob?: string | null
          gender?: string | null
          last_visit?: string | null
          mrn?: number | null
          name?: string | null
          patient_id: number
        }
        Update: {
          age?: number | null
          dob?: string | null
          gender?: string | null
          last_visit?: string | null
          mrn?: number | null
          name?: string | null
          patient_id?: number
        }
        Relationships: []
      }
      phenom_risk: {
        Row: {
          calculated_date: string | null
          change_since: string | null
          DEATH: number | null
          DEATH_change: number | null
          EMERGENCY_VISIT: number | null
          EMERGENCY_VISIT_change: number | null
          FALL: number | null
          FALL_change: number | null
          HOSPITALIZATION: number | null
          HOSPITALIZATION_change: number | null
          INFARCTION: number | null
          INFARCTION_change: number | null
          patient_id: number | null
          risk_type: string | null
          STROKE: number | null
          STROKE_change: number | null
          time_period: number | null
          uniq_risk_idx: number | null
        }
        Insert: {
          calculated_date?: string | null
          change_since?: string | null
          DEATH?: number | null
          DEATH_change?: number | null
          EMERGENCY_VISIT?: number | null
          EMERGENCY_VISIT_change?: number | null
          FALL?: number | null
          FALL_change?: number | null
          HOSPITALIZATION?: number | null
          HOSPITALIZATION_change?: number | null
          INFARCTION?: number | null
          INFARCTION_change?: number | null
          patient_id?: number | null
          risk_type?: string | null
          STROKE?: number | null
          STROKE_change?: number | null
          time_period?: number | null
          uniq_risk_idx?: number | null
        }
        Update: {
          calculated_date?: string | null
          change_since?: string | null
          DEATH?: number | null
          DEATH_change?: number | null
          EMERGENCY_VISIT?: number | null
          EMERGENCY_VISIT_change?: number | null
          FALL?: number | null
          FALL_change?: number | null
          HOSPITALIZATION?: number | null
          HOSPITALIZATION_change?: number | null
          INFARCTION?: number | null
          INFARCTION_change?: number | null
          patient_id?: number | null
          risk_type?: string | null
          STROKE?: number | null
          STROKE_change?: number | null
          time_period?: number | null
          uniq_risk_idx?: number | null
        }
        Relationships: []
      }
      phenom_risk_dist: {
        Row: {
          cohort: string | null
          fact_type: string
          range: string
          time_period: number
          value: number | null
        }
        Insert: {
          cohort?: string | null
          fact_type: string
          range: string
          time_period: number
          value?: number | null
        }
        Update: {
          cohort?: string | null
          fact_type?: string
          range?: string
          time_period?: number
          value?: number | null
        }
        Relationships: []
      }
      phenom_risk_raw: {
        Row: {
          calculated_date: string | null
          fact_type: string
          patient_id: number
          probability: number | null
          relative_risk: number | null
          time_period: number | null
        }
        Insert: {
          calculated_date?: string | null
          fact_type: string
          patient_id: number
          probability?: number | null
          relative_risk?: number | null
          time_period?: number | null
        }
        Update: {
          calculated_date?: string | null
          fact_type?: string
          patient_id?: number
          probability?: number | null
          relative_risk?: number | null
          time_period?: number | null
        }
        Relationships: []
      }
      phenom_risk_summary: {
        Row: {
          fact_type: string
          id: number
          patient_id: number
          summary: string
        }
        Insert: {
          fact_type: string
          id?: number
          patient_id: number
          summary: string
        }
        Update: {
          fact_type?: string
          id?: number
          patient_id?: number
          summary?: string
        }
        Relationships: [
          {
            foreignKeyName: "phenom_risk_summary_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patient"
            referencedColumns: ["patient_id"]
          },
        ]
      }
      roles: {
        Row: {
          id: string
          role: string
        }
        Insert: {
          id: string
          role: string
        }
        Update: {
          id?: string
          role?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_admin_role: {
        Args: { user_uuid: string }
        Returns: boolean
      }
    }
    Enums: {
      risk_type: "relative" | "absolute"
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
      risk_type: ["relative", "absolute"],
    },
  },
} as const
