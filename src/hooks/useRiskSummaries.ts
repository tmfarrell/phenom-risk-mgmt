
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface RiskSummary {
  id: number;
  patient_id: number;
  fact_type: string;
  summary: string;
}

export const useRiskSummaries = (patientId?: number) => {
  return useQuery({
    queryKey: ['risk-summaries', patientId],
    queryFn: async (): Promise<RiskSummary[]> => {
      if (!patientId) return [];
      
      console.log(`Fetching risk summaries for patient ${patientId}`);
      
      const { data, error } = await supabase
        .from('phenom_risk_summary')
        .select('*')
        .neq('fact_type', 'HISTORY')
        .eq('patient_id', patientId);
        
      if (error) {
        console.error('Error fetching risk summaries:', error);
        throw new Error('Failed to fetch risk summaries');
      }
      
      console.log('Fetched risk summaries:', data);
      return data || [];
    },
    enabled: !!patientId,
  });
};
