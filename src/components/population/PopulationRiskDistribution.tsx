import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { ChartContainer } from '@/components/ui/chart';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RISK_COLUMNS } from '../table/tableConstants';

interface PopulationRiskDistributionProps {
  selectedTimeframe: string;
  selectedRiskType: 'relative' | 'absolute';
}

export function PopulationRiskDistribution({ 
  selectedTimeframe,
  selectedRiskType,
}: PopulationRiskDistributionProps) {
  const [selectedRiskFactor, setSelectedRiskFactor] = useState<string>(RISK_COLUMNS[0]);

  const { data: distributionData, isLoading } = useQuery({
    queryKey: ['risk-distribution', selectedTimeframe, selectedRiskType, selectedRiskFactor],
    queryFn: async () => {
      console.log('Fetching risk distribution data...');
      const { data, error } = await supabase
        .from('phenom_risk_dist')
        .select('*');

      if (error) {
        console.error('Error fetching risk distribution:', error);
        throw error;
      }

      return data;
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-end space-x-4">
        <div className="w-[200px]">
          <Label className="mb-2 block">Risk Factor</Label>
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
      </div>

      <div className="h-[400px] w-full">
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
          <BarChart
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
            />
            <YAxis 
              label={{ 
                value: 'Number of Patients', 
                angle: -90, 
                position: 'insideLeft',
                style: { textAnchor: 'middle' }
              }} 
            />
            <Tooltip />
            <Legend />
            <Bar 
              dataKey="pre" 
              fill="#60A5FA" 
              name="Previous Distribution"
            />
            <Bar 
              dataKey="post" 
              fill="#3B82F6" 
              name="Current Distribution"
            />
          </BarChart>
        </ChartContainer>
      </div>
    </div>
  );
}