
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
import { useVersionLabels } from '@/hooks/useVersionLabels';

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
  const { getTimePeriodLabel, interventionLabel, formatTimePeriodWithUnit } = useVersionLabels();

  // Function to sort risk ranges properly
  const sortRiskRanges = (data: any[]) => {
    if (!data || data.length === 0) return [];
    
    return [...data].sort((a, b) => {
      const aStart = parseInt(a.range.split('-')[0]);
      const bStart = parseInt(b.range.split('-')[0]);
      return aStart - bStart;
    });
  };

  // Query to get available interventions
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

  // Set default intervention when interventions are loaded
  useEffect(() => {
    if (interventions && interventions.length > 0 && !isInterventionLoaded) {
      setSelectedIntervention(interventions[0]);
      setIsInterventionLoaded(true);
    }
  }, [interventions, isInterventionLoaded]);

  // Query to get distribution data - only enabled when intervention is selected
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
    enabled: !!selectedIntervention // Only run query when intervention is selected
  });

  const isLoading = isInterventionsLoading || isDistributionLoading || !isInterventionLoaded;

  // Get properly sorted distribution data
  const sortedDistributionData = distributionData ? sortRiskRanges(distributionData) : [];

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
          <Label className="mb-2 block">{interventionLabel}</Label>
          <Select
            value={selectedIntervention}
            onValueChange={setSelectedIntervention}
            disabled={isInterventionsLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder={isInterventionsLoading ? "Loading..." : `Select ${interventionLabel.toLowerCase()}`} />
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
            <ToggleGroupItem 
              value="1" 
              className={cn(
                "px-4 py-2 rounded-md",
                localTimeframe === '1' ? "bg-blue-100 hover:bg-blue-200" : "hover:bg-gray-100"
              )}
            >
              {formatTimePeriodWithUnit(1)}
            </ToggleGroupItem>
            <ToggleGroupItem 
              value="5"
              className={cn(
                "px-4 py-2 rounded-md",
                localTimeframe === '5' ? "bg-blue-100 hover:bg-blue-200" : "hover:bg-gray-100"
              )}
            >
              {formatTimePeriodWithUnit(5)}
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      {/* Display loading state when interventions are being loaded */}
      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <p>Loading {interventionLabel.toLowerCase()} data...</p>
        </div>
      ) : (
        <>
          {/* Header for Intervention Summary Table - reduced space between title and subtitle */}
          <div className="space-y-0.5">
            <h3 className="text-2xl font-medium" style={{ color: '#002B71' }}>Predicted {getTimePeriodLabel(selectedTimeframe)} {selectedRiskFactor} Risk</h3>
            <p>Before vs After {selectedIntervention}</p>
          </div>
          
          {/* Tabs to separate Summary and Distribution */}
          <Tabs defaultValue="distribution" onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 w-60">
              <TabsTrigger value="distribution">Distribution</TabsTrigger>
              <TabsTrigger value="summary">Summary</TabsTrigger>
            </TabsList>
            
            {/* Summary Table Tab */}
            <TabsContent value="summary">
              <InterventionSummaryTable 
                selectedRiskFactor={selectedRiskFactor}
                selectedIntervention={selectedIntervention}
                selectedTimeframe={localTimeframe}
              />
            </TabsContent>
            
            {/* Risk Distribution Chart Tab */}
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
                          value: `Predicted ${getTimePeriodLabel(selectedTimeframe)} ${selectedRiskFactor} Risk (%)`, 
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
