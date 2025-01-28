import { Person } from '@/types/population';

export const RISK_COLUMNS = [
  'ED',
  'Hospitalization',
  'Fall',
  'Stroke',
  'MI',
] as const;

export const DISABLED_RISK_COLUMNS = [
  'Medication adherence'
] as const;

// Map display names to database field names
export const RISK_COLUMN_FIELD_MAP: Record<string, string> = {
  'ED': 'EMERGENCY_VISIT',
  'MI': 'INFARCTION'
};

export const getFieldName = (displayName: string): string => {
  return RISK_COLUMN_FIELD_MAP[displayName] || displayName;
};

export const isHighRisk = (value: number | null | undefined) => {
  if (value === null || value === undefined) return false;
  return value > 5;
};