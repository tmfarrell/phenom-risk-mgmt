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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
