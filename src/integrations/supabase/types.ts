export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
          fact_type: string
          intervention: string | null
          post: number | null
          pre: number | null
          range: string
          time_period: number
        }
        Insert: {
          fact_type: string
          intervention?: string | null
          post?: number | null
          pre?: number | null
          range: string
          time_period: number
        }
        Update: {
          fact_type?: string
          intervention?: string | null
          post?: number | null
          pre?: number | null
          range?: string
          time_period?: number
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
          risk_type: string
          summary: string
          time_period: number
        }
        Insert: {
          fact_type: string
          id?: number
          patient_id: number
          risk_type: string
          summary: string
          time_period: number
        }
        Update: {
          fact_type?: string
          id?: number
          patient_id?: number
          risk_type?: string
          summary?: string
          time_period?: number
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
      risk_type: "relative" | "absolute"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
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
