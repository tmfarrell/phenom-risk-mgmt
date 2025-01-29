import { Person } from '@/types/population';

export const formatRiskValue = (value: number | null, riskType: 'relative' | 'absolute') => {
  if (value === null) return 'N/A';
  return riskType === 'relative' ? `${value.toFixed(2)}` : `${Math.round(value)}%`;
};

export const formatChangeValue = (value: number, riskType: 'relative' | 'absolute') => {
  return riskType === 'relative' ? `${value.toFixed(2)}` : `${Math.round(value)}%`;
};

export const getArrowColor = (change: number, riskType: 'relative' | 'absolute') => {
  if (riskType === 'relative') {
    return change > 0.1 ? 'text-red-500' : 'text-green-500';
  }
  return change > 1 ? 'text-red-500' : 'text-green-500';
};

export const isHighRisk = (value: number | null, riskType: 'relative' | 'absolute') => {
  if (value === null) return false;
  return riskType === 'relative' ? value > 5 : value > 50;
};

export const getRiskValue = (risk: Person | undefined, riskFactor: string): number | null => {
  if (!risk) return null;
  const value = risk[riskFactor as keyof Person];
  return typeof value === 'number' ? value : null;
};

export const getChangeValue = (currentRisks: Person | undefined, riskFactor: string): number | null => {
  if (!currentRisks) return null;
  const changeKey = `${riskFactor}_change` as keyof Person;
  const value = currentRisks[changeKey];
  return typeof value === 'number' ? value : null;
};

export const getRiskTrendData = (risks: Person[], riskFactor: string) => {
  return risks
    .filter(r => getRiskValue(r, riskFactor) !== null)
    .map(r => ({
      value: getRiskValue(r, riskFactor) as number,
      date: r.recorded_date || undefined
    }))
    .sort((a, b) => {
      if (!a.date || !b.date) return 0;
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
};