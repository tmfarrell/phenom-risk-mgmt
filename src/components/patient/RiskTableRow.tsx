import { Person } from '@/types/population';
import { TableCell, TableRow } from '../ui/table';
import { format } from 'date-fns';
import { SparkLine } from './SparkLine';
import { RiskChangeIndicator } from './RiskChangeIndicator';
import { 
  formatRiskValue, 
  isHighRisk, 
  getRiskValue, 
  getChangeValue,
  getRiskTrendData 
} from './utils/riskUtils';

interface RiskTableRowProps {
  risk: string;
  currentRisks: Person | undefined;
  selectedRiskType: 'relative' | 'absolute';
  allRisks: Person[];
  averageRisk: string;
  yAxisDomain: [number, number];
}

const riskDetails: Record<string, { fullName: string; description: string }> = {
  'ED': {
    fullName: 'Emergency Department',
    description: 'Risk of an emergency department encounter'
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
    description: 'Risk of a future stroke'
  },
  'MI': {
    fullName: 'Myocardial Infarction',
    description: 'Risk of a myocardial infarction'
  }
};

export const RiskTableRow = ({ 
  risk, 
  currentRisks, 
  selectedRiskType, 
  allRisks,
  averageRisk,
  yAxisDomain 
}: RiskTableRowProps) => {
  const details = riskDetails[risk];
  
  // Check if all values for this risk factor are null
  const hasValidRiskData = allRisks.some(r => getRiskValue(r, risk) !== null);

  return (
    <TableRow>
      <TableCell className="font-medium">
        <div className="flex flex-col items-start">
          <span className="font-bold">{details.fullName}</span>
          <span className="text-sm text-gray-500 font-normal">{details.description}</span>
        </div>
      </TableCell>
      <TableCell className="min-w-[220px]">
        {hasValidRiskData ? (
          <SparkLine 
            data={getRiskTrendData(allRisks, risk)}
            yAxisDomain={yAxisDomain}
            averageRisk={selectedRiskType === 'absolute' ? averageRisk : undefined}
            riskType={selectedRiskType}
          />
        ) : (
          <div className="text-gray-400 italic">No data available</div>
        )}
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
          format(new Date(currentRisks.recorded_date), 'yyyy-MM-dd') : 
          <span className="text-gray-400 italic">No data</span>
        }
      </TableCell>
    </TableRow>
  );
};