import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { RiskDistribution } from '@/types/procedure-readiness';

interface RiskDistributionChartProps {
  data: RiskDistribution[];
}

export function RiskDistributionChart({ data }: RiskDistributionChartProps) {
  const getBarColor = (range: string) => {
    const value = parseInt(range.split('-')[0]);
    if (value >= 60) return 'hsl(0, 72%, 51%)';
    if (value >= 30) return 'hsl(38, 92%, 50%)';
    return 'hsl(142, 71%, 45%)';
  };

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(210, 20%, 90%)" />
          <XAxis
            dataKey="range"
            tick={{ fontSize: 11, fill: 'hsl(210, 15%, 45%)' }}
            angle={-45}
            textAnchor="end"
            height={40}
            interval={0}
            tickMargin={2}
          />
          <YAxis
            scale="log"
            domain={[1, 'auto']}
            allowDataOverflow
            tick={{ fontSize: 12, fill: 'hsl(210, 15%, 45%)' }}
            label={{
              value: 'Members (log scale)',
              angle: -90,
              position: 'insideLeft',
              offset: 0,
              dy: 20,
              style: { fontSize: 12, fill: 'hsl(210, 15%, 45%)', textAnchor: 'middle' },
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(0, 0%, 100%)',
              border: '1px solid hsl(210, 20%, 90%)',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            }}
            labelStyle={{ fontWeight: 600, marginBottom: 4 }}
            formatter={(value: number) => [
              `${value} members`,
              'Count',
            ]}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.range)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
