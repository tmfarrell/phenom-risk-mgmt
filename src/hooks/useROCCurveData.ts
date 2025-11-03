import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ROCDataPoint {
  id: string;
  model_id: string;
  fpr: number;
  tpr: number;
  created_at: string;
  updated_at: string;
}

export const useROCCurveData = (modelId: string | null) => {
  return useQuery<ROCDataPoint[]>({
    queryKey: ['roc-curve-data', modelId],
    enabled: Boolean(modelId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    queryFn: async () => {
      if (!modelId) {
        return [];
      }

      const { data, error } = await supabase
        .from('phenom_model_roc')
        .select('*')
        .eq('model_id', modelId)
        .order('fpr', { ascending: true });

      if (error) {
        console.error('Error fetching ROC curve data:', error);
        return [];
      }

      return data || [];
    },
  });
};

export type UseROCCurveDataResult = ReturnType<typeof useROCCurveData>;
