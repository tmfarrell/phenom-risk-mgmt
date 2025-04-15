
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ReferenceLine, Legend } from 'recharts';
import { ChartContainer } from '@/components/ui/chart';
import { Label } from '@/components/ui/label';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RISK_COLUMNS, RISK_COLUMN_FIELD_MAP } from '../table/tableConstants';
import { cn } from '@/lib/utils';
import { InterventionSummaryTable } from './InterventionSummaryTable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppVersion } from '@/hooks/useAppVersion';

interface PopulationRiskDistributionProps {
  selectedTimeframe: string;
  selectedRiskType: 'relative' | 'absolute';
}

export function PopulationRiskDistribution({ 
  selectedTimeframe,
  selectedRiskType,
}: PopulationRiskDistributionProps) {
  const [selectedRiskFactor, setSelectedRiskFactor] = useState<string>(RISK_COLUMNS[0]);
  const [localTimeframe, setLocalTimeframe] = useState<string>(selectedTimeframe);
  const [selectedIntervention, setSelectedIntervention] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>("summary");
  const [isInterventionLoaded, setIsInterventionLoaded] = useState<boolean>(false);
  const { appVersion } = useAppVersion();
  
  const useMonthsForTimeframe = appVersion !== 'patient';

  // Fetch available time periods from the database
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

      // Get unique time periods
      const uniqueTimePeriods = [...new Set(data.map(item => item.time_period))].filter(Boolean).sort();
      console.log('Unique time periods from DB:', uniqueTimePeriods);
      return uniqueTimePeriods;
    }
  });

  // Set local timeframe when available time periods are loaded
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

  const { data: interventions, isLoading: isInterventionsLoading } = useQuery({
    queryKey: ['interventions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('phenom_risk_dist')
        .select('intervention');
      
      if (error) {
        console.error('Error fetching interventions:', error);
        throw error;
      }

      const uniqueInterventions = [...new Set(data.map(item => item.intervention))].filter(Boolean).sort();
      return uniqueInterventions;
    }
  });

  useEffect(() => {
    if (interventions && interventions.length > 0 && !isInterventionLoaded) {
      setSelectedIntervention(interventions[0]);
      setIsInterventionLoaded(true);
    }
  }, [interventions, isInterventionLoaded]);

  const { data: distributionData, isLoading: isDistributionLoading } = useQuery({
    queryKey: ['risk-distribution', localTimeframe, selectedRiskType, selectedRiskFactor, selectedIntervention],
    queryFn: async () => {
      const dbRiskFactor = RISK_COLUMN_FIELD_MAP[selectedRiskFactor];
      console.log('Fetching risk distribution data with params (PopulationRiskDistribution):', {
        timeframe: localTimeframe,
        riskType: selectedRiskType,
        riskFactor: selectedRiskFactor,
        dbRiskFactor: dbRiskFactor,
        intervention: selectedIntervention
      });

      const { data, error } = await supabase
        .from('phenom_risk_dist')
        .select('*')
        .eq('time_period', parseInt(localTimeframe))
        .eq('fact_type', dbRiskFactor)
        .eq('intervention', selectedIntervention);

      if (error) {
        console.error('Error fetching risk distribution:', error);
        throw error;
      }

      console.log('risk distribution data (PopulationRiskDistribution): ', data); 
      return sortRiskRanges(data);
    },
    enabled: !!selectedIntervention
  });

  const isLoading = isInterventionsLoading || isDistributionLoading || !isInterventionLoaded || isTimePeriodsLoading;

  const sortedDistributionData = distributionData ? sortRiskRanges(distributionData) : [];

  const getTimeUnitLabel = (timeframe: string) => {
    const numericTimeframe = parseInt(timeframe);
    if (useMonthsForTimeframe) {
      const months = numericTimeframe * 12;
      return `${months} Month${months !== 1 ? 's' : ''}`;
    } else {
      return `${numericTimeframe} Year${numericTimeframe !== 1 ? 's' : ''}`;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end items-center space-x-8">
        <div className="w-[200px]">
          <Label className="mb-2 block">Risk</Label>
          <Select
            value={selectedRiskFactor}
            onValueChange={setSelectedRiskFactor}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select risk factor" />
            </SelectTrigger>
            <SelectContent>
              {RISK_COLUMNS.map((riskFactor) => (
                <SelectItem key={riskFactor} value={riskFactor}>
                  {riskFactor}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-[325px]">
          <Label className="mb-2 block">Intervention</Label>
          <Select
            value={selectedIntervention}
            onValueChange={setSelectedIntervention}
            disabled={isInterventionsLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder={isInterventionsLoading ? "Loading..." : "Select intervention"} />
            </SelectTrigger>
            <SelectContent>
              {interventions?.map((intervention) => (
                <SelectItem key={intervention} value={intervention}>
                  {intervention}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label className="text-sm text-gray-600 text-center mx-auto">Time Period</Label>
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

      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <p>Loading intervention data...</p>
        </div>
      ) : (
        <>
          <div className="space-y-0.5">
            <h3 className="text-2xl font-medium" style={{ color: '#002B71' }}>Predicted {useMonthsForTimeframe ? (parseInt(selectedTimeframe) * 12) + ' month' : selectedTimeframe + ' year'} {selectedRiskFactor} Risk</h3>
            <p>Before vs After {selectedIntervention}</p>
          </div>
          
          <Tabs defaultValue="distribution" onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 w-60">
              <TabsTrigger value="distribution">Distribution</TabsTrigger>
              <TabsTrigger value="summary">Summary</TabsTrigger>
            </TabsList>
            
            <TabsContent value="summary">
              <InterventionSummaryTable 
                selectedRiskFactor={selectedRiskFactor}
                selectedIntervention={selectedIntervention}
                selectedTimeframe={localTimeframe}
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
                      data={sortedDistributionData}
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
                          value: `Predicted ${useMonthsForTimeframe ? (parseInt(selectedTimeframe) * 12) + ' month' : selectedTimeframe + ' year'} ${selectedRiskFactor} Risk (%)`, 
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
                      <Area 
                        type="monotone"
                        dataKey="pre" 
                        fill="#757575" 
                        stroke="#757575"
                        name="Before Intervention"
                        fillOpacity={0} // Fill is transparent
                      />
                      <Area 
                        type="monotone"
                        dataKey="post" 
                        fill="#1E88E5" 
                        stroke="#1E88E5"
                        name="After Intervention"
                        fillOpacity={0} // Fill is transparent
                      />
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
