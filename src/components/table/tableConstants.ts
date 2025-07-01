
import { Person } from '@/types/population';

export const RISK_COLUMNS = [
  'ED',
  'Hospitalization',
  'Fall',
  'Stroke',
  'MI',
  'Mortality',
] as const;

export const DISABLED_RISK_COLUMNS = [
  'CKD',
  'COPD/Asthma',
  'Diabetes',
  'Medication adherence', 
  'Hereditary angioedema'
] as const;

// Map display names to database field names
export const RISK_COLUMN_FIELD_MAP: Record<string, string> = {
  'ED': 'EMERGENCY_VISIT',
  'Hospitalization': 'HOSPITALIZATION',
  'Fall': 'FALL',
  'Stroke': 'STROKE',
  'MI': 'INFARCTION',
  'Mortality': 'DEATH'
};

export const getFieldName = (displayName: string): string => {
  return RISK_COLUMN_FIELD_MAP[displayName] || displayName;
};

export const isHighRisk = (value: number | null | undefined) => {
  if (value === null || value === undefined) return false;
  return value > 1.75;
};
