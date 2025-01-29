import { Line, LineChart, ResponsiveContainer, Tooltip, YAxis, ReferenceLine } from 'recharts';
import { format } from 'date-fns';

interface SparkLineProps {
  data: Array<{
    value: number;
    date: string;
  }>;
  color?: string;
  yAxisDomain?: [number, number];
  averageRisk?: string;
  riskType?: 'relative' | 'absolute';
}

export const SparkLine = ({ 
  data, 
  color = "hsl(var(--primary))",
  yAxisDomain,
  averageRisk,
  riskType = 'absolute'
}: SparkLineProps) => {
  // Calculate domain to ensure reference line is visible
  const calculateDomain = () => {
    const values = data.map(d => d.value);
    if (riskType === 'absolute' && averageRisk !== undefined) {
      values.push(parseFloat(averageRisk.replace('%', '')));
    } else if (riskType === 'relative') {
      values.push(1); // Add reference value for relative risk
    }
    const min = Math.min(...values);
    const max = Math.max(...values);
    const padding = (max - min) * 0.1; // Add 10% padding
    return [Math.max(0, min - padding), max + padding];
  };

  return (
    <div className="w-[200px] h-[30px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <YAxis 
            domain={calculateDomain()}
            hide={true}
          />
          {riskType === 'absolute' && averageRisk !== undefined && (
            <ReferenceLine 
              y={parseFloat(averageRisk.replace('%', ''))} 
              stroke="#9CA3AF" 
              strokeDasharray="3 3"
            />
          )}
          {riskType === 'relative' && (
            <ReferenceLine 
              y={1} 
              stroke="#9CA3AF" 
              strokeDasharray="3 3"
            />
          )}
          <Tooltip 
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="bg-white border border-gray-200 shadow-sm rounded p-2 text-xs">
                    <div>value: {riskType === 'absolute' 
                      ? `${Math.round(data.value)}%` 
                      : data.value.toFixed(2)}</div>
                    <div>date: {format(new Date(data.date), 'MM/dd/yyyy')}</div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.5}
            dot={{ r: 1.5, fill: color }}
            activeDot={{ r: 3, fill: color }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};