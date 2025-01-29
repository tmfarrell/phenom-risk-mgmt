import { Person } from '@/types/population';

export const formatRiskValue = (value: number | null, riskType: 'relative' | 'absolute') => {
  if (value === null) return 'N/A';
  return riskType === 'relative' ? `${value.toFixed(2)}%` : `${value}`;
};

export const isHighRisk = (value: number | null, riskType: 'relative' | 'absolute') => {
  if (value === null) return false;
  return riskType === 'relative' ? value > 5 : value > 50;
};

export const getRiskValue = (risk: Person | undefined, riskFactor: string) => {
  return risk ? risk[riskFactor as keyof Person] : null;
};

export const getChangeValue = (currentRisks: Person | undefined, riskFactor: string) => {
  return currentRisks ? currentRisks[`${riskFactor}_change` as keyof Person] : null;
};

export const getRiskTrendData = (risks: Person[], riskFactor: string) => {
  return risks
    .filter(r => getRiskValue(r, riskFactor) !== null)
    .map(r => ({
      value: getRiskValue(r, riskFactor) as number,
      date: r.recorded_date
    }))
    .sort((a, b) => {
      if (!a.date || !b.date) return 0;
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
};
