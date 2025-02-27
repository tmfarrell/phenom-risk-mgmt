
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
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

export function PopulationRiskDistribution({ 
  selectedTimeframe,
  selectedRiskType,
}: PopulationRiskDistributionProps) {
  const [selectedRiskFactor, setSelectedRiskFactor] = useState<string>(RISK_COLUMNS[0]);
  const [localTimeframe, setLocalTimeframe] = useState<string>(selectedTimeframe);

  const { data: distributionData, isLoading } = useQuery({
    queryKey: ['risk-distribution', localTimeframe, selectedRiskType, selectedRiskFactor],
    queryFn: async () => {
      const dbRiskFactor = RISK_COLUMN_FIELD_MAP[selectedRiskFactor];
      console.log('Fetching risk distribution data with params:', {
        timeframe: localTimeframe,
        riskType: selectedRiskType,
        riskFactor: selectedRiskFactor,
        dbRiskFactor: dbRiskFactor,
      });

      const { data, error } = await supabase
        .from('phenom_risk_dist')
        .select('*')
        .eq('time_period', parseInt(localTimeframe))
        .eq('fact_type', dbRiskFactor);

      if (error) {
        console.error('Error fetching risk distribution:', error);
        throw error;
      }

      return data;
    }
  });

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
                angle={-45} 
                textAnchor="end"
                height={60}
                tickFormatter={(value) => value.split('-')[0]}
              />
              <YAxis 
                label={{ 
                  value: 'Number of Patients', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { textAnchor: 'middle' },
                  dx: -10
                }} 
              />
              <Tooltip />
              <Legend />
              <Area 
                type="monotone"
                dataKey="pre" 
                fill="#ef4444" 
                stroke="#ef4444"
                name="Before Intervention"
                fillOpacity={0.6}
              />
              <Area 
                type="monotone"
                dataKey="post" 
                fill="#22c55e" 
                stroke="#22c55e"
                name="After Intervention"
                fillOpacity={0.6}
              />
            </AreaChart>
          )}
        </ChartContainer>
      </div>
    </div>
  );
}
