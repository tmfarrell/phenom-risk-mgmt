
import { Person } from '@/types/population';

type AverageRisks = {
  [timeframe: string]: {
    [riskFactor: string]: string;
  };
};

export const calculateAverageRisks = (data: Person[]): AverageRisks => {
  // Group data by timeframe
  const groupedByTimeframe = data.reduce((acc, person) => {
    const timeframe = person.prediction_timeframe_yrs?.toString() || 'unknown';
    if (!acc[timeframe]) {
      acc[timeframe] = [];
    }
    acc[timeframe].push(person);
    return acc;
  }, {} as { [key: string]: Person[] });

  // Dynamically detect risk factors from the data
  // Exclude known non-risk properties
  const excludedKeys = new Set([
    'patient_id', 'name', 'mrn', 'dob', 'last_visit', 'age', 'gender', 
    'location', 'provider', 'provider_npi', 'recorded_date', 
    'prediction_timeframe_yrs', 'risk_type', 'change_since', 
    'composite_risk', 'history'
  ]);
  
  // Get all unique risk factors from the data
  const riskFactors = new Set<string>();
  data.forEach(person => {
    Object.keys(person).forEach(key => {
      // Add keys that don't end with '_change' and aren't in the excluded list
      if (!key.endsWith('_change') && !excludedKeys.has(key) && person[key] !== undefined) {
        riskFactors.add(key);
      }
    });
  });
  
  const averages: AverageRisks = {};
  
  Object.entries(groupedByTimeframe).forEach(([timeframe, patients]) => {
    averages[timeframe] = {};
    
    Array.from(riskFactors).forEach(factor => {
      // Filter to only include absolute risks and non-null values
      const absoluteRisks = patients.filter(person => 
        person.risk_type === 'absolute' && 
        person[factor as keyof Person] !== null &&
        person[factor as keyof Person] !== undefined &&
        !isNaN(Number(person[factor as keyof Person]))
      ).map(person => Number(person[factor as keyof Person]));

      if (absoluteRisks.length === 0) {
        averages[timeframe][factor] = 'N/A';
      } else {
        const average = absoluteRisks.reduce((sum, risk) => sum + risk, 0) / absoluteRisks.length;
        averages[timeframe][factor] = `${Math.round(average)}%`;
      }
    });
  });

  return averages;
};
