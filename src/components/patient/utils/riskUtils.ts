import { Person } from '@/types/population';

export const riskFieldMap = {
  'Mental Health': 'Mental_Health',
};

export const formatRiskValue = (value: number | string | null | undefined, riskType: 'relative' | 'absolute') => {
  if (typeof value === 'number') {
    if (riskType === 'absolute') {
      return `${Math.round(value)}%`;
    }
    return `${value.toFixed(1)}×`;  // Changed from 'x' to '×'
  }
  return 'Not available';
};

export const isHighRisk = (value: number | string | null | undefined, riskType: 'relative' | 'absolute') => {
  if (typeof value !== 'number') return false;
  return riskType === 'absolute' ? value > 50 : value > 5;
};

export const getRiskValue = (risks: Person | undefined, riskFactor: string) => {
  if (!risks) return null;
  const fieldName = riskFieldMap[riskFactor as keyof typeof riskFieldMap] || riskFactor;
  return risks[fieldName as keyof Person];
};

export const getChangeValue = (risks: Person | undefined, riskFactor: string) => {
  if (!risks) return null;
  const fieldName = `${riskFieldMap[riskFactor as keyof typeof riskFieldMap] || riskFactor}_change`;
  return risks[fieldName as keyof Person] as number | null;
};

export const formatChangeValue = (change: number, riskType: string) => {
  if (riskType === 'absolute') {
    return `${Math.round(change)}%`;
  }
  return change.toFixed(2);
};

export const getArrowColor = (change: number, riskType: string) => {
  if (riskType === 'absolute') {
    if (change > 15) return 'text-red-500';
    if (change < -15) return 'text-green-500';
    return 'text-black';
  } else {
    if (change > 1.5) return 'text-red-500';
    if (change < -1.5) return 'text-green-500';
    return 'text-black';
  }
};

export const getRiskTrendData = (allRisks: Person[], riskFactor: string) => {
  const fieldName = riskFieldMap[riskFactor as keyof typeof riskFieldMap] || riskFactor;
  return allRisks
    .sort((a, b) => {
      if (!a.recorded_date || !b.recorded_date) return 0;
      return new Date(a.recorded_date).getTime() - new Date(b.recorded_date).getTime();
    })
    .map(risk => {
      const value = risk[fieldName as keyof Person];
      return typeof value === 'number' ? value : 0;
    });
};