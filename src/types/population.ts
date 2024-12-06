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
  ED?: number;
  Hospitalization?: number;
  Fall?: number;
  Stroke?: number;
  MI?: number;
  CKD?: number;
  'Mental Health'?: number;
  [key: string]: string | number | null | undefined; // Allow dynamic risk conditions
}

export interface FilterCriteria {
  ageRange: [number, number];
  gender: string[];
  location: string[];
  occupation: string[];
}