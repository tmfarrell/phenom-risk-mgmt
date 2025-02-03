import { Line, LineChart, ResponsiveContainer, Tooltip, YAxis, ReferenceLine } from 'recharts';
import { format, parseISO } from 'date-fns';
import { zonedTimeToUtc, utcToZonedTime } from 'date-fns-tz';

interface DataPoint {
  value: number;
  date?: string;
}

interface SparkLineProps {
  data: DataPoint[];
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
  const calculateDomain = () => {
    const values = data.map(d => d.value);
    if (riskType === 'absolute' && averageRisk !== undefined) {
      values.push(parseFloat(averageRisk.replace('%', '')));
    } else if (riskType === 'relative') {
      values.push(1);
    }
    const min = Math.min(...values);
    const max = Math.max(...values);
    const padding = (max - min) * 0.1;
    return [Math.max(0, min - padding), max + padding];
  };

  const formatDate = (dateStr: string) => {
    const date = parseISO(dateStr);
    const zonedDate = utcToZonedTime(date, 'America/New_York');
    return format(zonedDate, 'yyyy-MM-dd');
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
                const dataPoint = payload[0].payload as DataPoint;
                return (
                  <div className="bg-white border border-gray-200 shadow-sm rounded p-2 text-xs">
                    <div>value: {riskType === 'absolute' ? 
                      `${Math.round(dataPoint.value)}%` : 
                      dataPoint.value.toFixed(2)
                    }</div>
                    {dataPoint.date && (
                      <div>date: {formatDate(dataPoint.date)}</div>
                    )}
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