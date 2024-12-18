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

  // Calculate averages for each timeframe and risk factor
  const riskFactors = ['ED', 'Hospitalization', 'Fall', 'Stroke', 'MI', 'CKD', 'Mental_Health'];
  
  const averages: AverageRisks = {};
  
  Object.entries(groupedByTimeframe).forEach(([timeframe, patients]) => {
    averages[timeframe] = {};
    
    riskFactors.forEach(factor => {
      // Filter to only include absolute risks and non-null values
      const absoluteRisks = patients.filter(person => 
        person.risk_type === 'absolute' && 
        person[factor as keyof Person] !== null
      ).map(person => person[factor as keyof Person] as number);

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