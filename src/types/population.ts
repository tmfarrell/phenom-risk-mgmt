export interface Person {
  patient_id: number;
  name: string | null;
  mrn?: number | null;
  dob?: string | null;
  last_visit?: string | null;
  age: number | null;
  gender: string | null;
  location?: string | null;
  recorded_date?: string | null;
  prediction_timeframe_yrs?: number | null;
  risk_type?: 'relative' | 'absolute';
  change_since?: string | null;
  // Risk factors with new database column names
  EMERGENCY_VISIT?: number | null;
  HOSPITALIZATION?: number | null;
  FALL?: number | null;
  STROKE?: number | null;
  INFARCTION?: number | null;
  // Risk changes with new database column names
  EMERGENCY_VISIT_change?: number | null;
  HOSPITALIZATION_change?: number | null;
  FALL_change?: number | null;
  STROKE_change?: number | null;
  INFARCTION_change?: number | null;
  [key: string]: string | number | null | undefined;
}

export interface FilterCriteria {
  ageRange: [number, number];
  gender: string[];
  location: string[];
  occupation: string[];
}