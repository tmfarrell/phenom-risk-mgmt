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
  provider_npi?: string | null;
  recorded_date?: string | null;
  prediction_timeframe_yrs?: number | null;
  risk_type?: 'relative' | 'absolute' | null;
  change_since?: string | null;
  composite_risk: number | null;
  history?: string | null;
  // Dynamic risk values - will be populated based on available outcomes
  [key: string]: string | number | null | undefined;
}

export interface FilterCriteria {
  ageRange: [number, number];
  gender: string[];
  location: string[];
  occupation: string[];
}