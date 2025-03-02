
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface RiskSummary {
  id: number;
  patient_id: number;
  fact_type: string;
  risk_type: string;
  time_period: number;
  summary: string;
}

export const useRiskSummaries = (patientId?: number) => {
  return useQuery({
    queryKey: ['risk-summaries', patientId],
    queryFn: async (): Promise<RiskSummary[]> => {
      if (!patientId) return [];
      
      const { data, error } = await supabase
        .from('phenom_risk_summary')
        .select('*')
        .eq('patient_id', patientId);
        
      if (error) {
        console.error('Error fetching risk summaries:', error);
        throw new Error('Failed to fetch risk summaries');
      }
      
      return data || [];
    },
    enabled: !!patientId,
  });
};
