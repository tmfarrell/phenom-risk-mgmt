
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

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
  selectedCohorts: string[];
}

// Default cost constant
const DEFAULT_COST_PER_EVENT = 2500; // default cost per event in dollars

export function InterventionSummaryTable({
  selectedRiskFactor,
  selectedIntervention,
  selectedTimeframe,
  selectedCohorts = [],
}: InterventionSummaryTableProps) {
  const [costPerEvent, setCostPerEvent] = useState(DEFAULT_COST_PER_EVENT);
  const generalPopulationCohort = "General Population";
  const isGeneralPopulationSelected = selectedCohorts.some(
    cohort => cohort.toLowerCase() === generalPopulationCohort.toLowerCase()
  );

  // Fetch distribution data for all selected cohorts
  const { data: distributionData, isLoading: isDistributionLoading } = useQuery({
    queryKey: ['intervention-summary-multi', selectedRiskFactor, selectedCohorts, selectedTimeframe],
    queryFn: async () => {
      // TEMPORARY: First, get all available fact_types from phenom_risk_dist
      const { data: factTypes, error: factTypesError } = await supabase
        .from('phenom_risk_dist')
        .select('fact_type')
        .eq('time_period', parseInt(selectedTimeframe))
        .limit(1000);

      if (factTypesError) {
        console.error('Error fetching fact types:', factTypesError);
        return [];
      }

      // Get unique fact_types
      const uniqueFactTypes = [...new Set(factTypes?.map(item => item.fact_type) || [])];
      
      if (uniqueFactTypes.length === 0) {
        console.log('No fact_types found for the selected timeframe');
        return [];
      }

      // TEMPORARY: Pick a random fact_type
      const randomFactType = uniqueFactTypes[Math.floor(Math.random() * uniqueFactTypes.length)];
      console.log(`TEMPORARY: Using random fact_type '${randomFactType}' instead of '${selectedRiskFactor}' for demo purposes in summary table`);
      
      // Get data for all selected cohorts
      const promises = selectedCohorts.map(async (cohort) => {
        const { data, error } = await supabase
          .from('phenom_risk_dist')
          .select('*')
          .eq('time_period', parseInt(selectedTimeframe))
          .eq('fact_type', randomFactType) // Use the random fact_type
          .eq('cohort', cohort);
        
        if (error) {
          console.error(`Error fetching risk distribution for ${cohort}:`, error);
          throw error;
        }
        
        return {
          cohort,
          data: data as RiskDistribution[]
        };
      });
      
      const results = await Promise.all(promises);
      return results;
    },
    enabled: selectedCohorts.length > 0 && !!selectedTimeframe
  });

  // Calculate stats from distribution data for a specific cohort
  const calculateStats = (data: RiskDistribution[] | undefined) => {
    if (!data || data.length === 0) return { mean: 0, median: 0, standardDeviation: 0, eventsPerThousand: 0, estimatedCost: 0 };
    
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
    
    // Estimate number of events per 1000 patients based on risk
    const eventsPerThousand = 1000 * (mean / 100);
    
    // Estimate cost based on events and user-defined cost per event
    const estimatedCost = eventsPerThousand * costPerEvent;
    
    return {
      mean: parseFloat(mean.toFixed(2)),
      median: parseFloat(median.toFixed(2)),
      standardDeviation: parseFloat(standardDeviation.toFixed(2)),
      eventsPerThousand: Math.round(eventsPerThousand),
      estimatedCost: Math.round(estimatedCost)
    };
  };

  // Find general population stats for comparison
  const getGeneralPopulationStats = () => {
    if (!distributionData) return null;
    
    const generalPopData = distributionData.find(
      item => item.cohort.toLowerCase() === generalPopulationCohort.toLowerCase()
    );
    
    if (!generalPopData) return null;
    
    return calculateStats(generalPopData.data);
  };

  const generalPopStats = getGeneralPopulationStats();
  const isLoading = isDistributionLoading || !distributionData;

  // Handle cost per event input change
  const handleCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numericValue = parseFloat(value);
    
    if (!isNaN(numericValue) && numericValue >= 0) {
      setCostPerEvent(numericValue);
    } else if (value === '') {
      setCostPerEvent(0);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Cost per event ($):</span>
          <Input
            type="number"
            value={costPerEvent}
            onChange={handleCostChange}
            className="w-24 h-8"
            min="0"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-48 w-full" />
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>Metric</TableHead>
                  {distributionData?.map(({ cohort }) => (
                    <TableHead key={cohort}>
                      {cohort}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Mean Risk</TableCell>
                  {distributionData?.map(({ cohort, data }) => {
                    const stats = calculateStats(data);
                    const isGeneralPop = cohort.toLowerCase() === generalPopulationCohort.toLowerCase();
                    
                    return (
                      <TableCell key={`${cohort}-mean`}>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{stats.mean}%</span>
                          {!isGeneralPop && generalPopStats && (
                            <ComparisonBadge 
                              value={stats.mean} 
                              baseline={generalPopStats.mean}
                              higherIsBetter={false}
                            />
                          )}
                        </div>
                      </TableCell>
                    );
                  })}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Median Risk</TableCell>
                  {distributionData?.map(({ cohort, data }) => {
                    const stats = calculateStats(data);
                    const isGeneralPop = cohort.toLowerCase() === generalPopulationCohort.toLowerCase();
                    
                    return (
                      <TableCell key={`${cohort}-median`}>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{stats.median}%</span>
                          {!isGeneralPop && generalPopStats && (
                            <ComparisonBadge 
                              value={stats.median} 
                              baseline={generalPopStats.median}
                              higherIsBetter={false}
                            />
                          )}
                        </div>
                      </TableCell>
                    );
                  })}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Events per 1,000 patients</TableCell>
                  {distributionData?.map(({ cohort, data }) => {
                    const stats = calculateStats(data);
                    const isGeneralPop = cohort.toLowerCase() === generalPopulationCohort.toLowerCase();
                    
                    return (
                      <TableCell key={`${cohort}-visits`}>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{stats.eventsPerThousand.toLocaleString()}</span>
                          {!isGeneralPop && generalPopStats && (
                            <ComparisonBadge 
                              value={stats.eventsPerThousand} 
                              baseline={generalPopStats.eventsPerThousand}
                              higherIsBetter={false}
                            />
                          )}
                        </div>
                      </TableCell>
                    );
                  })}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Estimated Cost per 1,000 patients</TableCell>
                  {distributionData?.map(({ cohort, data }) => {
                    const stats = calculateStats(data);
                    const isGeneralPop = cohort.toLowerCase() === generalPopulationCohort.toLowerCase();
                    
                    return (
                      <TableCell key={`${cohort}-cost`}>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">${stats.estimatedCost.toLocaleString()}</span>
                          {!isGeneralPop && generalPopStats && (
                            <ComparisonBadge 
                              value={stats.estimatedCost} 
                              baseline={generalPopStats.estimatedCost}
                              higherIsBetter={false}
                            />
                          )}
                        </div>
                      </TableCell>
                    );
                  })}
                </TableRow>
              </TableBody>
            </Table>
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p>* Estimates are based on risk values and may vary from actual outcomes.</p>
            <p>* Cost estimates are calculated by multiplying events per 1,000 patients by the cost per event (${costPerEvent}).</p>
          </div>
        </>
      )}
    </div>
  );
}

// Helper component to display comparison with general population
function ComparisonBadge({ 
  value, 
  baseline, 
  higherIsBetter = false 
}: { 
  value: number, 
  baseline: number, 
  higherIsBetter?: boolean 
}) {
  if (!baseline) return null;
  
  const percentChange = ((value - baseline) / baseline) * 100;
  const absoluteChange = Math.abs(percentChange);
  
  if (Math.abs(percentChange) < 1) return null;
  
  const isPositive = percentChange > 0;
  const isGood = (higherIsBetter && isPositive) || (!higherIsBetter && !isPositive);
  
  return (
    <Badge 
      variant="outline" 
      className={`text-xs ${isGood ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
    >
      {isPositive ? '+' : '-'}{absoluteChange.toFixed(1)}%
    </Badge>
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
