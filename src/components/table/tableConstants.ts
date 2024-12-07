import { Person } from '@/types/population';

export const RISK_COLUMNS = [
  'ED',
  'Hospitalization',
  'Fall',
  'Stroke',
  'MI',
  'CKD',
  'Mental Health',
] as const;

export const isHighRisk = (value: number | null | undefined) => {
  if (value === null || value === undefined) return false;
  return value > 5;
};