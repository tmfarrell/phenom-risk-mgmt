
import { Person } from '@/types/population';
import { ChartContainer } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { format } from 'date-fns';
import { formatRiskValue } from '@/components/patient/utils/riskUtils';

interface RiskTrendsChartProps {
  data: Person[];
  selectedRiskType: 'relative' | 'absolute';
}

const RISK_COLORS = {
  ED: '#ef4444',
  Hospitalization: '#f97316',
  Fall: '#eab308',
  Stroke: '#84cc16',
  MI: '#22c55e',
  CKD: '#06b6d4',
  Mental_Health: '#8b5cf6'
};

const RISK_LABELS = {
  ED: 'ED',
  Hospitalization: 'Hospitalization',
  Fall: 'Fall',
  Stroke: 'Stroke',
  MI: 'MI',
  CKD: 'CKD',
  Mental_Health: 'Mental Health'
};

export function RiskTrendsChart({ data, selectedRiskType }: RiskTrendsChartProps) {
  // Sort data by recorded_date
  const sortedData = [...data].sort((a, b) => {
    if (!a.recorded_date || !b.recorded_date) return 0;
    return new Date(a.recorded_date).getTime() - new Date(b.recorded_date).getTime();
  });

  return (
    <div className="h-[400px] w-full mt-8">
      <h3 className="text-lg font-semibold mb-4">Risk Trends Over Time</h3>
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
        <LineChart
          data={sortedData}
          margin={{
            top: 20,
            right: 20,
            bottom: 20,
            left: 20,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="recorded_date"
            tickFormatter={(date) => format(new Date(date), 'MM/dd/yyyy')}
          />
          <YAxis />
          <Tooltip
            labelFormatter={(date) => format(new Date(date), 'MM/dd/yyyy')}
            formatter={(value: number, name: string) => [
              selectedRiskType === 'absolute' ? `${value.toFixed(1)}%` : value.toFixed(2),
              RISK_LABELS[name as keyof typeof RISK_LABELS] || name
            ]}
          />
          <Legend />
          {Object.entries(RISK_COLORS).map(([risk, color]) => (
            <Line
              key={risk}
              type="monotone"
              dataKey={risk}
              stroke={color}
              name={RISK_LABELS[risk as keyof typeof RISK_LABELS]}
              dot={true}
            />
          ))}
        </LineChart>
      </ChartContainer>
    </div>
  );
}
