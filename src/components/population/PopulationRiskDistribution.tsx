import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ReferenceLine, Legend } from 'recharts';
import { ChartContainer } from '@/components/ui/chart';
import { Label } from '@/components/ui/label';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
// Dynamic outcomes will be fetched from phenom_models
import { cn } from '@/lib/utils';
import { InterventionSummaryTable } from './InterventionSummaryTable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppVersion } from '@/hooks/useAppVersion';
import { Badge } from '@/components/ui/badge';
import { Check, ChevronsUpDown, X, ExternalLink, AlertCircle } from 'lucide-react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';

interface PopulationRiskDistributionProps {
  selectedTimeframe: string;
  selectedRiskType: 'relative' | 'absolute';
}

export function PopulationRiskDistribution({ 
  selectedTimeframe,
  selectedRiskType,
}: PopulationRiskDistributionProps) {
  const [selectedRiskFactor, setSelectedRiskFactor] = useState<string>('');
  const [localTimeframe, setLocalTimeframe] = useState<string>(selectedTimeframe);
  const [selectedCohorts, setSelectedCohorts] = useState<string[]>([]);
  const [cohortsPopoverOpen, setCohortsPopoverOpen] = useState<boolean>(false);
  const [outcomePopoverOpen, setOutcomePopoverOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("summary");
  const { appVersion } = useAppVersion();
  
  const useMonthsForTimeframe = appVersion !== 'patient';

  // Fetch available outcomes from phenom_models
  const { data: phenomModelsData, isLoading: isOutcomesLoading } = useQuery({
    queryKey: ['population-outcomes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('phenom_models')
        .select('id, indication_code, prediction_timeframe_yrs')
        .not('prediction_timeframe_yrs', 'is', null)
        .order('indication_code');
      
      if (error) {
        console.error('Error fetching outcomes:', error);
        throw error;
      }

      // Create a map of outcomes to their available timeframes and model info
      const outcomeTimeframeMap: Record<string, number[]> = {};
      const outcomeModelMap: Record<string, Array<{id: string, timeframe: number}>> = {};
      
      data?.forEach(item => {
        if (!outcomeTimeframeMap[item.indication_code]) {
          outcomeTimeframeMap[item.indication_code] = [];
          outcomeModelMap[item.indication_code] = [];
        }
        if (!outcomeTimeframeMap[item.indication_code].includes(item.prediction_timeframe_yrs)) {
          outcomeTimeframeMap[item.indication_code].push(item.prediction_timeframe_yrs);
        }
        outcomeModelMap[item.indication_code].push({
          id: item.id,
          timeframe: item.prediction_timeframe_yrs
        });
      });
      
      return { outcomeTimeframeMap, outcomeModelMap };
    }
  });

  // Get available outcomes with model info for the selected timeframe
  const availableOutcomes = phenomModelsData?.outcomeTimeframeMap
    ? Object.entries(phenomModelsData.outcomeTimeframeMap)
        .filter(([_, timeframes]) => timeframes.includes(parseInt(localTimeframe)))
        .map(([outcome]) => outcome)
        .sort()
    : [];
    
  // Get model data for available outcomes
  const availableModelsForTimeframe = phenomModelsData?.outcomeModelMap
    ? Object.entries(phenomModelsData.outcomeModelMap)
        .reduce((acc, [outcome, models]) => {
          const modelsForTimeframe = models.filter(m => m.timeframe === parseInt(localTimeframe));
          if (modelsForTimeframe.length > 0) {
            acc.push({
              outcome,
              modelId: modelsForTimeframe[0].id // Use the first model ID for this outcome/timeframe combination
            });
          }
          return acc;
        }, [] as Array<{outcome: string, modelId: string}>)
        .sort((a, b) => a.outcome.localeCompare(b.outcome))
    : [];

  // Set default selected risk factor once outcomes are loaded
  useEffect(() => {
    if (availableOutcomes && availableOutcomes.length > 0) {
      // If no risk factor is selected, select the first one
      if (!selectedRiskFactor) {
        setSelectedRiskFactor(availableOutcomes[0]);
      }
      // If current risk factor is not available for the new timeframe, select the first available one
      else if (!availableOutcomes.includes(selectedRiskFactor)) {
        setSelectedRiskFactor(availableOutcomes[0]);
      }
    }
  }, [availableOutcomes, selectedRiskFactor]);

  const { data: timePeriods, isLoading: isTimePeriodsLoading } = useQuery({
    queryKey: ['time-periods'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('phenom_risk_dist')
        .select('time_period')
        .order('time_period');
      
      if (error) {
        console.error('Error fetching time periods:', error);
        throw error;
      }

      const uniqueTimePeriods = [...new Set(data.map(item => item.time_period))].filter(Boolean).sort();
      console.log('Unique time periods from DB:', uniqueTimePeriods);
      return uniqueTimePeriods;
    }
  });

  // Sync localTimeframe with selectedTimeframe prop
  useEffect(() => {
    setLocalTimeframe(selectedTimeframe);
  }, [selectedTimeframe]);

  useEffect(() => {
    if (timePeriods && timePeriods.length > 0 && (!localTimeframe || !timePeriods.includes(parseInt(localTimeframe)))) {
      setLocalTimeframe(timePeriods[0].toString());
    }
  }, [timePeriods, localTimeframe]);

  const sortRiskRanges = (data: any[]) => {
    if (!data || data.length === 0) return [];
    
    return [...data].sort((a, b) => {
      const aStart = parseInt(a.range.split('-')[0]);
      const bStart = parseInt(b.range.split('-')[0]);
      return aStart - bStart;
    });
  };

  const { data: cohorts, isLoading: isCohortsLoading } = useQuery({
    queryKey: ['cohorts'],
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

  useEffect(() => {
    if (cohorts && cohorts.length > 0 && selectedCohorts.length === 0) {
      const generalPopulationIndex = cohorts.findIndex(cohort => 
        cohort.toLowerCase() === "general population");
      
      if (generalPopulationIndex !== -1) {
        const secondCohortIndex = generalPopulationIndex === cohorts.length - 1 ? 0 : generalPopulationIndex + 1;
        if (generalPopulationIndex !== secondCohortIndex) {
          setSelectedCohorts([cohorts[generalPopulationIndex], cohorts[secondCohortIndex]]);
        } else if (cohorts.length > 1) {
          const altIndex = (generalPopulationIndex + 1) % cohorts.length;
          setSelectedCohorts([cohorts[generalPopulationIndex], cohorts[altIndex]]);
        } else {
          setSelectedCohorts([cohorts[generalPopulationIndex]]);
        }
      } else if (cohorts.length >= 2) {
        setSelectedCohorts([cohorts[0], cohorts[1]]);
      } else if (cohorts.length === 1) {
        setSelectedCohorts([cohorts[0]]);
      }
    }
  }, [cohorts, selectedCohorts.length]);

  const { data: distributionData, isLoading: isDistributionLoading } = useQuery({
    queryKey: ['risk-distribution', localTimeframe, selectedRiskType, selectedRiskFactor, selectedCohorts],
    queryFn: async () => {
      console.log('Fetching risk distribution data with params:', {
        timeframe: localTimeframe,
        riskType: selectedRiskType,
        riskFactor: selectedRiskFactor,
        cohorts: selectedCohorts
      });

      if (!selectedCohorts.length) return [];

      // TEMPORARY: First, get all available fact_types from phenom_risk_dist
      const { data: factTypes, error: factTypesError } = await supabase
        .from('phenom_risk_dist')
        .select('fact_type')
        .eq('time_period', parseInt(localTimeframe))
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
      console.log(`TEMPORARY: Using random fact_type '${randomFactType}' instead of '${selectedRiskFactor}' for demo purposes`);

      const promises = selectedCohorts.map(async (cohort) => {
        const { data, error } = await supabase
          .from('phenom_risk_dist')
          .select('*')
          .eq('time_period', parseInt(localTimeframe))
          .eq('fact_type', randomFactType) // Use the random fact_type
          .eq('cohort', cohort);

        if (error) {
          console.error(`Error fetching risk distribution for cohort ${cohort}:`, error);
          return [];
        }

        return data;
      });

      const results = await Promise.all(promises);
      
      const allRanges = new Set<string>();
      const cohortData: Record<string, Record<string, number>> = {};
      
      results.forEach((cohortResults, index) => {
        const cohortName = selectedCohorts[index];
        cohortData[cohortName] = {};
        
        cohortResults.forEach(result => {
          allRanges.add(result.range);
          cohortData[cohortName][result.range] = result.value;
        });
      });
      
      const combinedData = Array.from(allRanges).map(range => {
        const entry: any = { range };
        
        selectedCohorts.forEach(cohort => {
          entry[cohort] = cohortData[cohort][range] || 0;
        });
        
        return entry;
      });

      console.log('Combined distribution data:', combinedData);
      return sortRiskRanges(combinedData);
    },
    enabled: selectedCohorts.length > 0
  });

  const isLoading = isCohortsLoading || isDistributionLoading || isTimePeriodsLoading || isOutcomesLoading || selectedCohorts.length === 0;

  const getTimeUnitLabel = (timeframe: string) => {
    const numericTimeframe = parseInt(timeframe);
    if (useMonthsForTimeframe) {
      const months = numericTimeframe * 12;
      return `${months} Month${months !== 1 ? 's' : ''}`;
    } else {
      return `${numericTimeframe} Year${numericTimeframe !== 1 ? 's' : ''}`;
    }
  };

  const COHORT_COLORS = [
    '#1E88E5', // Blue
    '#F44336', // Red
    '#4CAF50', // Green
    '#FF9800', // Orange
    '#9C27B0', // Purple
    '#795548', // Brown
    '#607D8B', // Blue Grey
    '#E91E63', // Pink
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-end items-center space-x-8">
        <div className="grid grid-cols-3 gap-8 flex-1 mr-8">
          <div className="flex flex-col gap-2">
            <Label className="text-sm text-gray-600">Outcome</Label>
            <Popover open={outcomePopoverOpen} onOpenChange={setOutcomePopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={outcomePopoverOpen}
                  className="w-full justify-between"
                  disabled={isOutcomesLoading}
                >
                  {selectedRiskFactor || "Select outcome"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search outcomes..." />
                  <CommandList>
                    <CommandEmpty>No outcome found.</CommandEmpty>
                    <CommandGroup>
                      {availableOutcomes?.map((outcome) => {
                        const modelInfo = availableModelsForTimeframe.find(m => m.outcome === outcome);
                        return (
                          <CommandItem
                            key={outcome}
                            value={outcome}
                            onSelect={() => {
                              setSelectedRiskFactor(outcome);
                              setOutcomePopoverOpen(false);
                            }}
                            className="group"
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedRiskFactor === outcome ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <span className="flex-1">{outcome}</span>
                            {modelInfo && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  window.open(`/phenom-builder/${modelInfo.modelId}`, '_blank');
                                }}
                                className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                title="View model details"
                              >
                                <ExternalLink className="h-3 w-3 text-gray-500 hover:text-blue-600" />
                              </button>
                            )}
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-sm text-gray-600">Cohort</Label>
            <Popover open={cohortsPopoverOpen} onOpenChange={setCohortsPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={cohortsPopoverOpen}
                  className="w-full justify-between"
                  disabled={isCohortsLoading}
                >
                  {selectedCohorts.length > 0 
                    ? `${selectedCohorts.length} selected`
                    : isCohortsLoading 
                      ? "Loading..." 
                      : "Select cohorts"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search cohorts..." />
                  <CommandList>
                    <CommandEmpty>No cohorts found.</CommandEmpty>
                    <CommandGroup>
                      {cohorts?.map((cohort) => {
                        return (
                          <CommandItem
                            key={cohort}
                            value={cohort}
                            onSelect={() => {
                              setSelectedCohorts(prev =>
                                prev.includes(cohort)
                                  ? prev.filter(c => c !== cohort)
                                  : [...prev, cohort]
                              );
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedCohorts.includes(cohort) ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {cohort}
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            
            {selectedCohorts.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {selectedCohorts.map((cohort, index) => {
                  return (
                    <Badge 
                      key={cohort} 
                      variant="secondary"
                      className="flex items-center gap-1"
                      style={{ backgroundColor: `${COHORT_COLORS[index % COHORT_COLORS.length]}20` }}
                    >
                      {cohort}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => setSelectedCohorts(prev => prev.filter(c => c !== cohort))}
                      />
                    </Badge>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-sm text-gray-600">Time Period</Label>
            <ToggleGroup 
              type="single" 
              value={localTimeframe}
              onValueChange={(value) => {
                if (value) setLocalTimeframe(value);
              }}
              className="flex gap-2"
            >
              {isTimePeriodsLoading ? (
                <div className="px-4 py-2">Loading...</div>
              ) : (
                timePeriods?.map((period: number) => (
                  <ToggleGroupItem 
                    key={period}
                    value={period.toString()}
                    className={cn(
                      "px-4 py-2 rounded-md",
                      localTimeframe === period.toString() ? "bg-blue-100 hover:bg-blue-200" : "hover:bg-gray-100"
                    )}
                  >
                    {getTimeUnitLabel(period.toString())}
                  </ToggleGroupItem>
                ))
              )}
            </ToggleGroup>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <p>Loading cohort data...</p>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            <h3 className="text-2xl font-medium" style={{ color: '#002B71' }}>
              Predicted {useMonthsForTimeframe ? (parseInt(localTimeframe) * 12) + ' month' : localTimeframe + ' year'} {selectedRiskFactor} Risk
            </h3>
          </div>
          
          <Tabs defaultValue="distribution" onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 w-60">
              <TabsTrigger value="distribution">Distribution</TabsTrigger>
              <TabsTrigger value="summary">Summary</TabsTrigger>
            </TabsList>
            
            <TabsContent value="summary">
              <InterventionSummaryTable 
                selectedRiskFactor={selectedRiskFactor}
                selectedIntervention={selectedCohorts[0] || ""}
                selectedTimeframe={localTimeframe}
                selectedCohorts={selectedCohorts}
              />
            </TabsContent>
            
            <TabsContent value="distribution">
              <div className="h-[500px] w-full">
                <h3 className="text-lg font-medium mb-2">Risk Distribution</h3>
                <ChartContainer
                  className="h-full"
                  config={{
                    primary: {
                      theme: {
                        light: "hsl(var(--primary))",
                        dark: "hsl(var(--primary))",
                      },
                    },
                  }}
                >
                  {isDistributionLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <p>Loading...</p>
                    </div>
                  ) : (
                    <AreaChart
                      data={distributionData}
                      margin={{
                        top: 20,
                        right: 20,
                        bottom: 60,
                        left: 40,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="range" 
                        height={60}
                        label={{ 
                          value: `Predicted ${useMonthsForTimeframe ? (parseInt(localTimeframe) * 12) + ' month' : localTimeframe + ' year'} ${selectedRiskFactor} Risk (%)`, 
                          position: 'insideBottom',
                          offset: -15,
                          style: { 
                            textAnchor: 'middle',
                            fontSize: 14,
                            fontWeight: 500
                          }
                        }}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis 
                        label={{ 
                          value: 'Number of patients', 
                          angle: -90, 
                          position: 'insideLeft',
                          style: { 
                            textAnchor: 'middle',
                            fontSize: 14,
                            fontWeight: 500
                          },
                          dx: -10
                        }}
                        tick={{ fontSize: 12 }} 
                      />
                      <Legend 
                        verticalAlign="top" 
                        align="right"
                        wrapperStyle={{ 
                          paddingTop: '10px',
                          paddingRight: '10px'
                        }}
                      />
                      
                      {selectedCohorts.map((cohort, index) => (
                        <Area 
                          key={cohort}
                          type="monotone"
                          dataKey={cohort} 
                          name={cohort}
                          fill={COHORT_COLORS[index % COHORT_COLORS.length]}
                          stroke={COHORT_COLORS[index % COHORT_COLORS.length]}
                          fillOpacity={0.1}
                        />
                      ))}
                    </AreaChart>
                  )}
                </ChartContainer>
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
