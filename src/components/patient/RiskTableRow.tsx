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

export const RiskTableRow = ({ 
  risk, 
  currentRisks, 
  selectedRiskType, 
  allRisks,
  averageRisk,
  yAxisDomain 
}: RiskTableRowProps) => {
  return (
    <TableRow>
      <TableCell className="font-medium">{risk}</TableCell>
      <TableCell>
        <SparkLine 
          data={getRiskTrendData(allRisks, risk)}
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
        {currentRisks?.recorded_date ? format(new Date(currentRisks.recorded_date), 'yyyy-MM-dd') : 'N/A'}
      </TableCell>
    </TableRow>
  );
};