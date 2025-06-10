export interface Person {
  patient_id: number;
  name: string | null;
  mrn?: number | null;
  dob?: string | null;
  last_visit?: string | null;
  age: number | null;
  gender: string | null;
  location?: string | null;
  provider?: string | null;
  recorded_date?: string | null;
  prediction_timeframe_yrs?: number | null;
  risk_type?: 'relative' | 'absolute' | null;
  change_since?: string | null;
  ED: number | null;
  Hospitalization: number | null;
  Fall: number | null;
  Stroke: number | null;
  MI: number | null;
  ED_change: number | null;
  Hospitalization_change: number | null;
  Fall_change: number | null;
  Stroke_change: number | null;
  MI_change: number | null;
  history?: string | null;
  [key: string]: string | number | null | undefined;
}

export interface FilterCriteria {
  ageRange: [number, number];
  gender: string[];
  location: string[];
  occupation: string[];
}