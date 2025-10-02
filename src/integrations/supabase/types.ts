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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      application_version: {
        Row: {
          application_title: string
          created_at: string
          display_name: string
          id: string
          updated_at: string
        }
        Insert: {
          application_title: string
          created_at?: string
          display_name: string
          id: string
          updated_at?: string
        }
        Update: {
          application_title?: string
          created_at?: string
          display_name?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      fd_score: {
        Row: {
          created_at: string | null
          fd_score: number
          id: number
          patient_id: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          fd_score: number
          id?: number
          patient_id: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          fd_score?: number
          id?: number
          patient_id?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      npi_lists: {
        Row: {
          created_at: string
          id: string
          name: string
          npi: string
          tier: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          npi: string
          tier?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          npi?: string
          tier?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      outcomes: {
        Row: {
          created_at: string
          enabled: boolean
          fact_column_name: string
          fact_description: string | null
          fact_header_name: string
          fact_id: string
          fact_list_name: string
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          fact_column_name: string
          fact_description?: string | null
          fact_header_name: string
          fact_id: string
          fact_list_name: string
          id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          fact_column_name?: string
          fact_description?: string | null
          fact_header_name?: string
          fact_id?: string
          fact_list_name?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
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
      phenom_models: {
        Row: {
          auc: number | null
          created_at: string
          history_code: string | null
          history_no_history: boolean | null
          history_type: string | null
          id: string
          indication_code: string
          indication_new_onset: boolean | null
          indication_type: string
          max_patient_age: number | null
          min_patient_age: number | null
          model_name: string
          patient_sex: string | null
          patients_phenom: number | null
          patients_total: number | null
          prediction_timeframe_yrs: number | null
          providers_phenom: number | null
          providers_total: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          auc?: number | null
          created_at?: string
          history_code?: string | null
          history_no_history?: boolean | null
          history_type?: string | null
          id?: string
          indication_code: string
          indication_new_onset?: boolean | null
          indication_type: string
          max_patient_age?: number | null
          min_patient_age?: number | null
          model_name: string
          patient_sex?: string | null
          patients_phenom?: number | null
          patients_total?: number | null
          prediction_timeframe_yrs?: number | null
          providers_phenom?: number | null
          providers_total?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          auc?: number | null
          created_at?: string
          history_code?: string | null
          history_no_history?: boolean | null
          history_type?: string | null
          id?: string
          indication_code?: string
          indication_new_onset?: boolean | null
          indication_type?: string
          max_patient_age?: number | null
          min_patient_age?: number | null
          model_name?: string
          patient_sex?: string | null
          patients_phenom?: number | null
          patients_total?: number | null
          prediction_timeframe_yrs?: number | null
          providers_phenom?: number | null
          providers_total?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      phenom_risk: {
        Row: {
          calculated_date: string | null
          change_since: string | null
          composite_risk: number | null
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
          composite_risk?: number | null
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
          composite_risk?: number | null
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
      provider: {
        Row: {
          ACTIVE_STATUS: boolean | null
          created_at: string
          id: string
          LAST_SOURCE_ACTIVITY_DATE: string | null
          NAME: string
          NPI: string
          NUMBER_OF_SOURCE_ENCOUNTERS: number | null
          ORGANIZATION: string | null
          ORGANIZATION_CATEGORY: string | null
          ORGANIZATION_CITY: string | null
          ORGANIZATION_CLASS: string | null
          ORGANIZATION_CLASS_SUBTYPE: string | null
          ORGANIZATION_ID: string | null
          ORGANIZATION_LATITUDE: number | null
          ORGANIZATION_LONGITUDE: number | null
          ORGANIZATION_REGION: string | null
          ORGANIZATION_STATE: string | null
          ORGANIZATION_ZIP5: string | null
          SPECIALTY: string | null
          SPECIALTY_TAXONOMY: string | null
          TEACHING_FACILITY_TYPE: string | null
          TYPE: string | null
          updated_at: string
          YEARS_IN_PRACTICE: number | null
        }
        Insert: {
          ACTIVE_STATUS?: boolean | null
          created_at?: string
          id?: string
          LAST_SOURCE_ACTIVITY_DATE?: string | null
          NAME: string
          NPI: string
          NUMBER_OF_SOURCE_ENCOUNTERS?: number | null
          ORGANIZATION?: string | null
          ORGANIZATION_CATEGORY?: string | null
          ORGANIZATION_CITY?: string | null
          ORGANIZATION_CLASS?: string | null
          ORGANIZATION_CLASS_SUBTYPE?: string | null
          ORGANIZATION_ID?: string | null
          ORGANIZATION_LATITUDE?: number | null
          ORGANIZATION_LONGITUDE?: number | null
          ORGANIZATION_REGION?: string | null
          ORGANIZATION_STATE?: string | null
          ORGANIZATION_ZIP5?: string | null
          SPECIALTY?: string | null
          SPECIALTY_TAXONOMY?: string | null
          TEACHING_FACILITY_TYPE?: string | null
          TYPE?: string | null
          updated_at?: string
          YEARS_IN_PRACTICE?: number | null
        }
        Update: {
          ACTIVE_STATUS?: boolean | null
          created_at?: string
          id?: string
          LAST_SOURCE_ACTIVITY_DATE?: string | null
          NAME?: string
          NPI?: string
          NUMBER_OF_SOURCE_ENCOUNTERS?: number | null
          ORGANIZATION?: string | null
          ORGANIZATION_CATEGORY?: string | null
          ORGANIZATION_CITY?: string | null
          ORGANIZATION_CLASS?: string | null
          ORGANIZATION_CLASS_SUBTYPE?: string | null
          ORGANIZATION_ID?: string | null
          ORGANIZATION_LATITUDE?: number | null
          ORGANIZATION_LONGITUDE?: number | null
          ORGANIZATION_REGION?: string | null
          ORGANIZATION_STATE?: string | null
          ORGANIZATION_ZIP5?: string | null
          SPECIALTY?: string | null
          SPECIALTY_TAXONOMY?: string | null
          TEACHING_FACILITY_TYPE?: string | null
          TYPE?: string | null
          updated_at?: string
          YEARS_IN_PRACTICE?: number | null
        }
        Relationships: []
      }
      provider_analytics: {
        Row: {
          AVG_PT_YR: number | null
          AVG_RX_PT_PAST_YR: number | null
          AVG_RX_PT_YR: number | null
          AVG_RX_YR: number | null
          NPI: string
          PRESCRIBING_DECILE: number | null
          PT_PAST_YR: number | null
          RX_PAST_YR: number | null
        }
        Insert: {
          AVG_PT_YR?: number | null
          AVG_RX_PT_PAST_YR?: number | null
          AVG_RX_PT_YR?: number | null
          AVG_RX_YR?: number | null
          NPI: string
          PRESCRIBING_DECILE?: number | null
          PT_PAST_YR?: number | null
          RX_PAST_YR?: number | null
        }
        Update: {
          AVG_PT_YR?: number | null
          AVG_RX_PT_PAST_YR?: number | null
          AVG_RX_PT_YR?: number | null
          AVG_RX_YR?: number | null
          NPI?: string
          PRESCRIBING_DECILE?: number | null
          PT_PAST_YR?: number | null
          RX_PAST_YR?: number | null
        }
        Relationships: []
      }
      provider_med_analytics: {
        Row: {
          avg_pt_yr: number | null
          avg_rx_pt_yr: number | null
          avg_rx_yr: number | null
          med_name: string | null
          npi: number | null
          pt_past_yr: number | null
          rx_past_yr: number | null
          rx_pt_past_yr: number | null
        }
        Insert: {
          avg_pt_yr?: number | null
          avg_rx_pt_yr?: number | null
          avg_rx_yr?: number | null
          med_name?: string | null
          npi?: number | null
          pt_past_yr?: number | null
          rx_past_yr?: number | null
          rx_pt_past_yr?: number | null
        }
        Update: {
          avg_pt_yr?: number | null
          avg_rx_pt_yr?: number | null
          avg_rx_yr?: number | null
          med_name?: string | null
          npi?: number | null
          pt_past_yr?: number | null
          rx_past_yr?: number | null
          rx_pt_past_yr?: number | null
        }
        Relationships: []
      }
      provider_model_analytics: {
        Row: {
          created_at: string
          id: number
          model_id: string
          npi: string
          patients_phenom: number | null
          patients_total: number | null
          phenom_lift: number | null
          status: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          model_id: string
          npi: string
          patients_phenom?: number | null
          patients_total?: number | null
          phenom_lift?: number | null
          status?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          model_id?: string
          npi?: string
          patients_phenom?: number | null
          patients_total?: number | null
          phenom_lift?: number | null
          status?: string | null
        }
        Relationships: []
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
      session_settings: {
        Row: {
          created_at: string
          id: string
          settings: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          settings?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          settings?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      provider_analytics_with_geography: {
        Row: {
          AVG_PT_YR: number | null
          AVG_RX_PT_PAST_YR: number | null
          AVG_RX_PT_YR: number | null
          AVG_RX_YR: number | null
          city: string | null
          created_at: string | null
          id: number | null
          latitude: number | null
          longitude: number | null
          model_id: string | null
          name: string | null
          npi: string | null
          NPI: string | null
          patients_phenom: number | null
          patients_total: number | null
          phenom_lift: number | null
          practice: string | null
          PRESCRIBING_DECILE: number | null
          provider_npi: string | null
          PT_PAST_YR: number | null
          region: string | null
          RX_PAST_YR: number | null
          specialty: string | null
          state: string | null
          status: string | null
          years_in_practice: number | null
          zip5: string | null
        }
        Relationships: []
      }
      provider_meds: {
        Row: {
          MED_NAME: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      check_admin_role: {
        Args: { user_uuid: string }
        Returns: boolean
      }
      get_npi_list_comparison: {
        Args: { p_list_name: string; p_model_id: string }
        Returns: {
          om1_avg_patients_per_year: number
          om1_avg_rx_per_patient_per_year: number
          om1_specialties: Json
          overlap_count: number
          providers_phenom: number
          providers_total: number
          user_avg_patients_per_year: number
          user_avg_rx_per_patient_per_year: number
          user_count: number
          user_specialties: Json
        }[]
      }
      get_providers_by_target: {
        Args: {
          p_list_name: string
          p_min_years?: number
          p_model_id: string
          p_page?: number
          p_page_size?: number
          p_regions?: string[]
          p_search_query?: string
          p_sort_direction?: string
          p_sort_field?: string
          p_specialties?: string[]
          p_states?: string[]
          p_status_values?: string[]
          p_target_filter: string
        }
        Returns: {
          city: string
          id: string
          is_client_target: boolean
          latitude: number
          longitude: number
          model_id: string
          name: string
          npi: string
          patients_total: number
          phenom_lift: number
          practice: string
          region: string
          specialty: string
          state: string
          status: string
          total_count: number
          years_in_practice: number
          zip5: string
        }[]
      }
      get_providers_with_medication_filters: {
        Args: {
          p_list_name?: string
          p_min_years?: number
          p_model_id: string
          p_not_prescribed_medications?: string[]
          p_page?: number
          p_page_size?: number
          p_prescribed_medications?: string[]
          p_search_query?: string
          p_sort_direction?: string
          p_sort_field?: string
          p_specialties?: string[]
          p_states?: string[]
          p_status_values?: string[]
          p_target_filter?: string
        }
        Returns: {
          city: string
          id: string
          is_client_target: boolean
          latitude: number
          longitude: number
          name: string
          npi: string
          patients_total: number
          phenom_lift: number
          practice: string
          specialty: string
          state: string
          status: string
          total_count: number
          years_in_practice: number
          zip5: string
        }[]
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
