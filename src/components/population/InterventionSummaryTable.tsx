
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RISK_COLUMN_FIELD_MAP } from '../table/tableConstants';
import { Badge } from '@/components/ui/badge';

type RiskDistribution = {
  range: string;
  cohort: string;
  value: number;
  fact_type: string;
  time_period: number;
};

interface InterventionSummaryTableProps {
  selectedRiskFactor: string;
  selectedIntervention: string;
  selectedTimeframe: string;
}

export function InterventionSummaryTable({
  selectedRiskFactor,
  selectedIntervention,
  selectedTimeframe,
}: InterventionSummaryTableProps) {
  const [localIntervention, setLocalIntervention] = useState<string>(selectedIntervention || '');

  useEffect(() => {
    if (selectedIntervention && selectedIntervention !== localIntervention) {
      setLocalIntervention(selectedIntervention);
    }
  }, [selectedIntervention]);

  // Fetch available cohorts
  const { data: cohorts, isLoading: isCohortsLoading } = useQuery({
    queryKey: ['summary-cohorts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('phenom_risk_dist')
        .select('cohort')
        .not('cohort', 'is', null);
      
      if (error) {
        console.error('Error fetching cohorts:', error);
        throw error;
      }

      const uniqueCohorts = [...new Set(data.map(item => item.cohort))].filter(Boolean).sort();
      return uniqueCohorts;
    }
  });

  // Set the first available cohort if none is selected
  useEffect(() => {
    if (cohorts && cohorts.length > 0 && !localIntervention) {
      setLocalIntervention(cohorts[0]);
    }
  }, [cohorts, localIntervention]);

  // Fetch distribution data for the intervention
  const { data: distributionData, isLoading: isDistributionLoading } = useQuery({
    queryKey: ['intervention-summary', selectedRiskFactor, localIntervention, selectedTimeframe],
    queryFn: async () => {
      const dbRiskFactor = RISK_COLUMN_FIELD_MAP[selectedRiskFactor];
      
      const { data, error } = await supabase
        .from('phenom_risk_dist')
        .select('*')
        .eq('time_period', parseInt(selectedTimeframe))
        .eq('fact_type', dbRiskFactor)
        .eq('cohort', localIntervention);
      
      if (error) {
        console.error('Error fetching risk distribution:', error);
        throw error;
      }
      
      return data as RiskDistribution[];
    },
    enabled: !!localIntervention && !!selectedTimeframe
  });

  // Calculate stats from distribution data
  const calculateStats = (data: RiskDistribution[] | undefined) => {
    if (!data || data.length === 0) return { mean: 0, median: 0, standardDeviation: 0 };
    
    // Assuming each range represents a bucket with values at the middle of the range
    const weightedValues = data.map(item => {
      const range = item.range;
      const rangeParts = range.split('-');
      const rangeStart = parseFloat(rangeParts[0]);
      const rangeEnd = parseFloat(rangeParts[1] || rangeStart.toString());
      const midpoint = (rangeStart + rangeEnd) / 2;
      
      return {
        midpoint,
        count: item.value
      };
    });
    
    // Calculate total patients
    const totalPatients = weightedValues.reduce((sum, item) => sum + item.count, 0);
    
    // Calculate mean
    const sum = weightedValues.reduce((sum, item) => sum + (item.midpoint * item.count), 0);
    const mean = totalPatients > 0 ? sum / totalPatients : 0;
    
    // Sort values for median calculation
    const sortedValues: number[] = [];
    weightedValues.forEach(item => {
      for (let i = 0; i < item.count; i++) {
        sortedValues.push(item.midpoint);
      }
    });
    sortedValues.sort((a, b) => a - b);
    
    // Calculate median
    const middleIndex = Math.floor(sortedValues.length / 2);
    const median = sortedValues.length % 2 === 0
      ? (sortedValues[middleIndex - 1] + sortedValues[middleIndex]) / 2
      : sortedValues[middleIndex];
    
    // Calculate standard deviation
    const squaredDiffs = weightedValues.reduce((sum, item) => {
      return sum + (Math.pow(item.midpoint - mean, 2) * item.count);
    }, 0);
    const variance = totalPatients > 0 ? squaredDiffs / totalPatients : 0;
    const standardDeviation = Math.sqrt(variance);
    
    return {
      mean: parseFloat(mean.toFixed(2)),
      median: parseFloat(median.toFixed(2)),
      standardDeviation: parseFloat(standardDeviation.toFixed(2))
    };
  };

  const stats = calculateStats(distributionData);
  const isLoading = isCohortsLoading || isDistributionLoading;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Risk Summary</h3>
        <div className="w-64">
          <Select
            value={localIntervention}
            onValueChange={setLocalIntervention}
            disabled={isCohortsLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select cohort" />
            </SelectTrigger>
            <SelectContent>
              {cohorts?.map((cohort) => (
                <SelectItem key={cohort} value={cohort}>
                  {cohort}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <p>Loading...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <StatCard
            title="Mean Risk"
            value={`${stats.mean}%`}
            description="Average risk across population"
          />
          <StatCard
            title="Median Risk"
            value={`${stats.median}%`}
            description="Middle value in risk distribution"
          />
          <StatCard
            title="Risk Spread"
            value={`±${stats.standardDeviation}%`}
            description="Standard deviation of risk"
          />
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, description }: { title: string; value: string; description: string }) {
  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
      <div className="flex flex-col space-y-1.5">
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="mt-4">
        <Badge variant="outline" className="px-3 py-1.5 text-xl font-bold">
          {value}
        </Badge>
      </div>
    </div>
  );
}
