import { Header } from '@/components/Header';
import { useState, useEffect } from 'react';
import { PopulationRiskDistribution } from '@/components/population/PopulationRiskDistribution';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export default function Population() {
  const selectedRiskType = 'absolute'; // Always use absolute risk values
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('1');

  // Fetch available time periods from phenom_models
  const { data: phenomModelsData, isLoading: isModelsLoading } = useQuery({
    queryKey: ['phenom-models-timeframes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('phenom_models')
        .select('prediction_timeframe_yrs')
        .not('prediction_timeframe_yrs', 'is', null)
        .order('prediction_timeframe_yrs');
      
      if (error) {
        console.error('Error fetching phenom_models:', error);
        throw error;
      }
      
      // Extract unique timeframes
      const numericTimeframes = [...new Set((data || [])
        .map(item => item.prediction_timeframe_yrs)
        .filter((v): v is number => typeof v === 'number'))].sort((a, b) => a - b);
      
      console.log('Available timeframes for population view:', numericTimeframes);
      
      return {
        timeframes: numericTimeframes
      };
    }
  });

  // Use timeframes from phenom_models
  const timePeriods = phenomModelsData?.timeframes || [1, 2];

  // Set initial timeframe when data is loaded
  useEffect(() => {
    if (timePeriods && timePeriods.length > 0) {
      const exists = timePeriods.includes(parseInt(selectedTimeframe));
      if (!exists) {
        setSelectedTimeframe(timePeriods[0].toString());
      }
    }
  }, [timePeriods]);

  return (
    <div className="min-h-screen w-full">
      <Header />
      <div className="flex items-start">
        <div className="px-6 pt-6">
          <h1 className="text-2xl font-bold text-blue-900 text-left">Population Risk Panel</h1>
        </div>
      </div>
      <div className="p-6">
        <div className="flex flex-col space-y-6">
            <div className="glass-card p-4 overflow-hidden">
              {/* Population Risk Distribution Component */}
              <PopulationRiskDistribution
                selectedTimeframe={selectedTimeframe}
                selectedRiskType={selectedRiskType}
              />
            </div>
        </div>
      </div>
    </div>
  );
}

