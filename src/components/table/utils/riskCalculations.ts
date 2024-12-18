import { Person } from '@/types/population';

export const calculateAverageRisk = (data: Person[], field: string): string => {
  // Filter to only include absolute risks, regardless of current view type
  const absoluteRisks = data.filter(person => 
    person.risk_type === 'absolute' && 
    person[field as keyof Person] !== null
  ).map(person => person[field as keyof Person] as number);

  if (absoluteRisks.length === 0) return 'N/A';
  
  const average = absoluteRisks.reduce((sum, risk) => sum + risk, 0) / absoluteRisks.length;
  return `${Math.round(average)}%`;
};