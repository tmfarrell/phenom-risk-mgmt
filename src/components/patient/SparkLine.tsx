import { Line, LineChart, ResponsiveContainer, Tooltip, YAxis, ReferenceLine } from 'recharts';

interface SparkLineProps {
  data: number[];
  color?: string;
  yAxisDomain?: [number, number];
  averageRisk?: string;
}

export const SparkLine = ({ 
  data, 
  color = "hsl(var(--primary))",
  yAxisDomain,
  averageRisk
}: SparkLineProps) => {
  // Transform data into format required by recharts
  const chartData = data.map((value, index) => ({ value }));

  // Parse average risk from string (e.g., "25%" -> 25)
  const avgValue = averageRisk ? parseFloat(averageRisk.replace('%', '')) : undefined;

  // Calculate domain to ensure average line is visible
  const calculateDomain = () => {
    const values = data;
    if (avgValue !== undefined) {
      values.push(avgValue);
    }
    const min = Math.min(...values);
    const max = Math.max(...values);
    const padding = (max - min) * 0.1; // Add 10% padding
    return [Math.max(0, min - padding), max + padding];
  };

  return (
    <div className="w-[200px] h-[30px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <YAxis 
            domain={calculateDomain()}
            hide={true}
          />
          {avgValue !== undefined && (
            <ReferenceLine 
              y={avgValue} 
              stroke="#9CA3AF" 
              strokeDasharray="3 3"
            />
          )}
          <Tooltip 
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const value = payload[0].value;
                return (
                  <div className="bg-white border border-gray-200 shadow-sm rounded p-2 text-xs">
                    {typeof value === 'number' ? value.toFixed(2) : value}
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