import { Person } from '@/types/population';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { format } from 'date-fns';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { usePatientData } from '@/hooks/usePatientData';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { SparkLine } from './SparkLine';

interface RiskTableProps {
  currentRisks: Person | undefined;
  selectedRiskType: 'relative' | 'absolute';
  allRisks: Person[];
}

export const RiskTable = ({ currentRisks, selectedRiskType, allRisks }: RiskTableProps) => {
  const riskFactors = ['ED', 'Hospitalization', 'Fall', 'Stroke', 'MI', 'CKD', 'Mental Health'];
  const riskFieldMap = {
    'Mental Health': 'Mental_Health',
  };

  const { data: patientData } = usePatientData();

  // Calculate global min and max for all sparklines
  const allSparklineData = riskFactors.map(risk => {
    const fieldName = riskFieldMap[risk as keyof typeof riskFieldMap] || risk;
    return allRisks
      .sort((a, b) => {
        if (!a.recorded_date || !b.recorded_date) return 0;
        return new Date(a.recorded_date).getTime() - new Date(b.recorded_date).getTime();
      })
      .map(risk => {
        const value = risk[fieldName as keyof Person];
        return typeof value === 'number' ? value : 0;
      });
  }).flat();

  const globalMin = Math.min(...allSparklineData);
  const globalMax = Math.max(...allSparklineData);
  
  // Add padding to the domain
  const padding = (globalMax - globalMin) * 0.1;
  const yAxisDomain: [number, number] = [
    Math.max(0, globalMin - padding), // Don't go below 0 for risk values
    globalMax + padding
  ];

  const calculateAverageRisk = (riskFactor: string, timeframe: number | undefined) => {
    if (!patientData || !timeframe) return 'N/A';
    
    // Always filter for absolute risks regardless of selected risk type
    const relevantRisks = patientData.filter(
      p => p.risk_type === 'absolute' && 
      p.prediction_timeframe_yrs === timeframe
    );

    if (relevantRisks.length === 0) return 'N/A';

    const fieldName = riskFieldMap[riskFactor as keyof typeof riskFieldMap] || riskFactor;
    const sum = relevantRisks.reduce((acc, curr) => {
      const value = curr[fieldName as keyof Person];
      return acc + (typeof value === 'number' ? value : 0);
    }, 0);

    const avg = sum / relevantRisks.length;
    return `${Math.round(avg)}%`;
  };

  const formatRiskValue = (value: number | string | null | undefined, riskType: 'relative' | 'absolute') => {
    if (typeof value === 'number') {
      if (riskType === 'absolute') {
        return `${Math.round(value)}%`;
      }
      return `${value.toFixed(2)}x`;
    }
    return 'Not available';
  };

  const isHighRisk = (value: number | string | null | undefined, riskType: 'relative' | 'absolute') => {
    if (typeof value !== 'number') return false;
    return riskType === 'absolute' ? value > 50 : value > 5;
  };

  const getRiskValue = (risks: Person | undefined, riskFactor: string) => {
    if (!risks) return null;
    const fieldName = riskFieldMap[riskFactor as keyof typeof riskFieldMap] || riskFactor;
    return risks[fieldName as keyof Person];
  };

  const getChangeValue = (risks: Person | undefined, riskFactor: string) => {
    if (!risks) return null;
    const fieldName = `${riskFieldMap[riskFactor as keyof typeof riskFieldMap] || riskFactor}_change`;
    return risks[fieldName as keyof Person] as number | null;
  };

  const formatChangeValue = (change: number, riskType: string) => {
    if (riskType === 'absolute') {
      return `${Math.round(change)}%`;
    }
    return change.toFixed(2);
  };

  const getArrowColor = (change: number, riskType: string) => {
    if (riskType === 'absolute') {
      if (change > 15) return 'text-red-500';
      if (change < -15) return 'text-green-500';
      return 'text-black';
    } else {
      if (change > 0.75) return 'text-red-500';
      if (change < -0.75) return 'text-green-500';
      return 'text-black';
    }
  };

  const renderChangeArrow = (change: number | null, threshold: number) => {
    if (!change || Math.abs(change) <= threshold) return null;

    const tooltipText = `${formatChangeValue(change, selectedRiskType)} change from ${currentRisks?.change_since || 'unknown date'}`;
    const arrowColor = getArrowColor(change, selectedRiskType);

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            {change > 0 
              ? <ArrowUp className={`h-4 w-4 ${arrowColor}`} />
              : <ArrowDown className={`h-4 w-4 ${arrowColor}`} />
            }
          </TooltipTrigger>
          <TooltipContent>
            <p>{tooltipText}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  const getRiskTrendData = (riskFactor: string) => {
    const fieldName = riskFieldMap[riskFactor as keyof typeof riskFieldMap] || riskFactor;
    return allRisks
      .sort((a, b) => {
        if (!a.recorded_date || !b.recorded_date) return 0;
        return new Date(a.recorded_date).getTime() - new Date(b.recorded_date).getTime();
      })
      .map(risk => {
        const value = risk[fieldName as keyof Person];
        return typeof value === 'number' ? value : 0;
      });
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Risk Factor</TableHead>
            <TableHead>Risk Trend</TableHead>
            <TableHead>Risk Value</TableHead>
            <TableHead>Calculated Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {riskFactors.map((risk) => (
            <TableRow key={risk}>
              <TableCell className="font-medium">{risk}</TableCell>
              <TableCell>
                <SparkLine 
                  data={getRiskTrendData(risk)} 
                  yAxisDomain={yAxisDomain}
                />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1">
                      <span className={`${isHighRisk(getRiskValue(currentRisks, risk), selectedRiskType) ? 'bg-red-100' : ''} px-2 py-1 rounded`}>
                        {formatRiskValue(getRiskValue(currentRisks, risk), selectedRiskType)}
                      </span>
                      {renderChangeArrow(
                        getChangeValue(currentRisks, risk),
                        selectedRiskType === 'absolute' ? 5 : 0.3
                      )}
                    </div>
                    <div className="text-xs text-blue-400/70 bg-white px-2 py-1 rounded mt-1 shadow-sm">
                      Avg: {calculateAverageRisk(risk, currentRisks?.prediction_timeframe_yrs)}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                {currentRisks?.recorded_date ? format(new Date(currentRisks.recorded_date), 'yyyy-MM-dd') : 'N/A'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
