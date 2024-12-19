import { Line, LineChart, ResponsiveContainer } from 'recharts';

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
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.5}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};