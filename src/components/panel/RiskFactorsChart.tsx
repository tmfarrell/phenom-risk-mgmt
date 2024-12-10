import { Person } from '@/types/population';
import { ChartContainer } from '@/components/ui/chart';
import { ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface RiskFactorsChartProps {
  chartData: any[];
  selectedRiskType: 'relative' | 'absolute';
}

export function RiskFactorsChart({ chartData, selectedRiskType }: RiskFactorsChartProps) {
  return (
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
        <ComposedChart
          data={chartData}
          margin={{
            top: 20,
            right: 20,
            bottom: 60,
            left: 60,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="factor" angle={-45} textAnchor="end" height={60} />
          <YAxis />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              return (
                <div className="bg-white p-3 border rounded shadow-lg">
                  <p className="font-semibold">{label}</p>
                  {[1, 5].map(timeframe => (
                    <div key={timeframe} className="mt-2">
                      <p className="font-medium">{timeframe} Year:</p>
                      <p>Min: {payload[0].payload[`${timeframe}yr_min`]?.toFixed(2)}</p>
                      <p>Q1: {payload[0].payload[`${timeframe}yr_q1`]?.toFixed(2)}</p>
                      <p>Median: {payload[0].payload[`${timeframe}yr_median`]?.toFixed(2)}</p>
                      <p>Q3: {payload[0].payload[`${timeframe}yr_q3`]?.toFixed(2)}</p>
                      <p>Max: {payload[0].payload[`${timeframe}yr_max`]?.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              );
            }}
          />
          <Legend />
          <Bar
            dataKey="1yr_median"
            fill="#60A5FA"
            name="1 Year Risk"
            barSize={20}
          />
          <Bar
            dataKey="5yr_median"
            fill="#3B82F6"
            name="5 Year Risk"
            barSize={20}
          />
        </ComposedChart>
      </ChartContainer>
    </div>
  );
}