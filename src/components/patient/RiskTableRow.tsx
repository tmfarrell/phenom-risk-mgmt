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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

  return (
    <TableRow>
      <TableCell className="font-medium">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className="text-left">
              {details.fullName}
            </TooltipTrigger>
            <TooltipContent>
              <p>{details.description}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </TableCell>
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