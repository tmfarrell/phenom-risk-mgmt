
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

interface PopulationRiskDistributionProps {
  selectedTimeframe: string;
  selectedRiskType: 'relative' | 'absolute';
}

// Define risk categories
type RiskCategory = 'Low' | 'Medium' | 'High';

interface RiskDistributionData {
  range: string;
  pre: number;
  post: number;
  category?: RiskCategory;
}

export function PopulationRiskDistribution({ 
  selectedTimeframe,
  selectedRiskType,
}: PopulationRiskDistributionProps) {
  const [selectedRiskFactor, setSelectedRiskFactor] = useState<string>(RISK_COLUMNS[0]);
  const [localTimeframe, setLocalTimeframe] = useState<string>(selectedTimeframe);
  const [selectedIntervention, setSelectedIntervention] = useState<string>('None');
  const [categorizedData, setCategorizedData] = useState<RiskDistributionData[]>([]);

  const { data: distributionData, isLoading } = useQuery({
    queryKey: ['risk-distribution', localTimeframe, selectedRiskType, selectedRiskFactor, selectedIntervention],
    queryFn: async () => {
      const dbRiskFactor = RISK_COLUMN_FIELD_MAP[selectedRiskFactor];
      console.log('Fetching risk distribution data with params:', {
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

      return data;
    }
  });

  // Query to get available interventions
  const { data: interventions } = useQuery({
    queryKey: ['interventions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('phenom_risk_dist')
        .select('intervention');
      
      if (error) {
        console.error('Error fetching interventions:', error);
        throw error;
      }

      // Process the data to get unique interventions
      const uniqueInterventions = [...new Set(data.map(item => item.intervention))].filter(Boolean).sort();
      return uniqueInterventions;
    }
  });

  // Set default intervention to the first one in the sorted list when interventions are loaded
  useEffect(() => {
    if (interventions && interventions.length > 0) {
      setSelectedIntervention(interventions[0]);
    }
  }, [interventions]);

  // Calculate the mean value and categorize data
  useEffect(() => {
    if (!distributionData || distributionData.length === 0) return;
    
    // Sort data by risk value (low to high)
    const sortedData = [...distributionData].sort((a, b) => {
      const aValue = parseInt(a.range.split('-')[0]);
      const bValue = parseInt(b.range.split('-')[0]);
      return aValue - bValue;
    });

    // Calculate total patients and cumulative sum for finding mean
    const totalPre = sortedData.reduce((sum, item) => sum + (item.pre || 0), 0);
    
    // Find the approximate mean value (simple approach)
    let meanValue = 0;
    let cumulativeCount = 0;
    for (const item of sortedData) {
      cumulativeCount += (item.pre || 0);
      if (cumulativeCount >= totalPre / 2) {
        // Get the middle of this range
        const [min, max] = item.range.split('-').map(v => parseInt(v));
        meanValue = (min + max) / 2;
        break;
      }
    }
    
    // Determine thresholds for categories
    // Using simple approach: values below 2/3 of mean are 'Low', above 4/3 are 'High'
    const lowThreshold = meanValue * 0.67;
    const highThreshold = meanValue * 1.33;
    
    // Create categories based on thresholds
    const categorized: { [key: string]: RiskDistributionData } = {
      'Low': { range: 'Low', pre: 0, post: 0, category: 'Low' },
      'Medium': { range: 'Medium', pre: 0, post: 0, category: 'Medium' },
      'High': { range: 'High', pre: 0, post: 0, category: 'High' }
    };
    
    // Aggregate data into categories
    sortedData.forEach(item => {
      const rangeValue = parseInt(item.range.split('-')[0]);
      let category: RiskCategory;
      
      if (rangeValue < lowThreshold) {
        category = 'Low';
      } else if (rangeValue > highThreshold) {
        category = 'High';
      } else {
        category = 'Medium';
      }
      
      categorized[category].pre += item.pre || 0;
      categorized[category].post += item.post || 0;
    });
    
    // Convert back to array for chart use
    setCategorizedData(Object.values(categorized));
  }, [distributionData]);

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

        <div className="w-[325px]"> {/* Increased width by 30% from 250px to 325px */}
          <Label className="mb-2 block">Intervention</Label>
          <Select
            value={selectedIntervention}
            onValueChange={setSelectedIntervention}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select intervention" />
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
              1 Year
            </ToggleGroupItem>
            <ToggleGroupItem 
              value="5"
              className={cn(
                "px-4 py-2 rounded-md",
                localTimeframe === '5' ? "bg-blue-100 hover:bg-blue-200" : "hover:bg-gray-100"
              )}
            >
              5 Years
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      <div className="h-[500px] w-full">
        <h3 className="text-xl font-medium mb-2">{selectedRiskFactor} Risk Distribution - {selectedIntervention}</h3>
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
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <p>Loading...</p>
            </div>
          ) : (
            <AreaChart
              data={categorizedData}
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
                angle={0} 
                textAnchor="middle"
                height={60}
                label={{ 
                  value: `${selectedRiskFactor} Risk Category`, 
                  position: 'insideBottom',
                  offset: -15,
                  style: { 
                    textAnchor: 'middle',
                    fontSize: 14,
                    fontWeight: 500
                  }
                }}
                tick={{ fontSize: 14 }}
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
                fill="#ef4444" 
                stroke="#ef4444"
                name="Before Intervention"
                fillOpacity={0} // Fill transparent
              />
              <Area 
                type="monotone"
                dataKey="post" 
                fill="#22c55e" 
                stroke="#22c55e"
                name="After Intervention"
                fillOpacity={0} // Fill transparent
              />
            </AreaChart>
          )}
        </ChartContainer>
      </div>
    </div>
  );
}
