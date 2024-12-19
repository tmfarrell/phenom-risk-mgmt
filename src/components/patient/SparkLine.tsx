import { Line, LineChart, ResponsiveContainer, Tooltip, YAxis } from 'recharts';

interface SparkLineProps {
  data: number[];
  color?: string;
  yAxisDomain?: [number, number];
}

export const SparkLine = ({ 
  data, 
  color = "hsl(var(--primary))",
  yAxisDomain
}: SparkLineProps) => {
  // Transform data into format required by recharts
  const chartData = data.map((value, index) => ({ value }));

  return (
    <div className="w-[100px] h-[30px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <YAxis 
            domain={yAxisDomain || ['auto', 'auto']}
            hide={true}
          />
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