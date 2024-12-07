export interface Person {
  patient_id: number;
  name: string | null;
  mrn?: number | null;
  dob?: string | null;
  last_visit?: string | null;
  age: number | null;
  gender: string | null;
  location: string | null;
  recorded_date?: string | null;
  prediction_timeframe_yrs?: number | null;
  risk_type?: 'relative' | 'absolute';
  // Risk factors from phenom_risk
  ED?: number | null;
  Hospitalization?: number | null;
  Fall?: number | null;
  Stroke?: number | null;
  MI?: number | null;
  CKD?: number | null;
  'Mental Health'?: number | null;
  [key: string]: string | number | null | undefined;
}

export interface FilterCriteria {
  ageRange: [number, number];
  gender: string[];
  location: string[];
  occupation: string[];
}