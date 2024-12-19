import { Line, LineChart, ResponsiveContainer, Tooltip } from 'recharts';

interface SparkLineProps {
  data: number[];
  color?: string;
}

export const SparkLine = ({ data, color = "hsl(var(--primary))" }: SparkLineProps) => {
  // Transform data into format required by recharts
  const chartData = data.map((value, index) => ({ value }));

  return (
    <div className="w-[100px] h-[30px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <Tooltip 
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-white border border-gray-200 shadow-sm rounded p-2 text-xs">
                    {payload[0].value.toFixed(2)}
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