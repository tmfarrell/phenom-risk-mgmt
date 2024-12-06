export interface Person {
  patient_id: number;
  name: string | null;
  mrn?: number | null;
  dob?: string | null;
  last_visit?: string | null;
  age: number | null;
  gender: string | null;
  location: string | null;
  // Risk factors from phenom_risk_abs
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