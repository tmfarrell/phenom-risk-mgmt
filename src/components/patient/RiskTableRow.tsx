
import { Person } from '@/types/population';
import { TableCell, TableRow } from '../ui/table';
import { SparkLine } from './SparkLine';
import { RiskChangeIndicator } from './RiskChangeIndicator';
import { 
  formatRiskValue, 
  isHighRisk, 
  getRiskValue, 
  getChangeValue,
  getRiskTrendData 
} from './utils/riskUtils';
import { format, parseISO } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

interface RiskTableRowProps {
  risk: string;
  currentRisks: Person | undefined;
  selectedRiskType: 'relative' | 'absolute';
  allRisks: Person[];
  averageRisk: string;
  yAxisDomain: [number, number];
  summary: string | null;
}

const riskDetails: Record<string, { fullName: string; description: string }> = {
  'ED': {
    fullName: 'Emergency Department',
    description: 'Risk of an emergency department visit'
  },
  'Hospitalization': {
    fullName: 'Hospitalization',
    description: 'Risk of a hospital admission'
  },
  'Fall': {
    fullName: 'Fall',
    description: 'Risk of a patient fall requiring clinical attention'
  },
  'Stroke': {
    fullName: 'Stroke',
    description: 'Risk of first stroke'
  },
  'MI': {
    fullName: 'Myocardial Infarction',
    description: 'Risk of first myocardial infarction'
  }
};

export const RiskTableRow = ({ 
  risk, 
  currentRisks, 
  selectedRiskType, 
  allRisks,
  averageRisk,
  yAxisDomain,
  summary
}: RiskTableRowProps) => {
  const details = riskDetails[risk];
  
  // Check if all values for this risk factor are null
  const hasValidRiskData = allRisks.some(r => getRiskValue(r, risk) !== null);

  const formatDate = (dateStr: string | undefined | null) => {
    if (!dateStr) return null;
    const date = parseISO(dateStr);
    const zonedDate = toZonedTime(date, 'America/New_York');
    return format(zonedDate, 'yyyy-MM-dd');
  };

  return (
    <>
      <TableRow>
        <TableCell className="font-medium">
          <div className="flex flex-col items-start">
            <span className="font-bold">{details.fullName}</span>
            <span className="text-sm text-gray-500 font-normal">{details.description}</span>
          </div>
        </TableCell>
        <TableCell className="min-w-[220px]">
          <SparkLine 
            data={hasValidRiskData ? getRiskTrendData(allRisks, risk) : []}
            yAxisDomain={yAxisDomain}
            averageRisk={selectedRiskType === 'absolute' ? averageRisk : undefined}
            riskType={selectedRiskType}
          />
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className={`${isHighRisk(getRiskValue(currentRisks, risk), selectedRiskType) ? 'bg-red-100' : ''} px-2 py-1 rounded`}>
                  {formatRiskValue(getRiskValue(currentRisks, risk), selectedRiskType)}
                </span>
                <RiskChangeIndicator 
                  change={getChangeValue(currentRisks, risk)}
                  selectedRiskType={selectedRiskType}
                  changeSince={currentRisks?.change_since}
                />
              </div>
              <div className="text-xs text-blue-400/70 bg-white px-2 py-1 rounded mt-1 shadow-sm">
                Avg: {averageRisk}
              </div>
            </div>
          </div>
        </TableCell>
        <TableCell>
          {hasValidRiskData && currentRisks?.recorded_date ? 
            formatDate(currentRisks.recorded_date) : 
            <span className="text-gray-400 italic">No data</span>
          }
        </TableCell>
      </TableRow>
      {summary && (
        <TableRow>
          <TableCell colSpan={4} className="bg-gray-50 pb-4">
            <div className="text-sm text-gray-700 p-2 border-l-2 border-blue-400 ml-4">
              <span className="font-medium text-blue-600">Analysis: </span>
              {summary}
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
};
