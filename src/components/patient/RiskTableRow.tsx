
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
import { useState } from 'react';
import { ChevronDown, ChevronRight, ExternalLink, X } from 'lucide-react';

interface RiskTableRowProps {
  risk: string;
  timeframe: string;
  valueKey?: string; // underlying field used for value/trend in demo mode
  currentRisks: Person | undefined;
  selectedRiskType: 'relative' | 'absolute';
  allRisks: Person[];
  averageRisk: string;
  yAxisDomain: [number, number];
  summary: string | null;
  onRemove?: () => void;
  modelId?: string;
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
  },
  'HS': {
    fullName: 'Hidradenitis Suppurativa',
    description: 'Risk of hidradenitis suppurativa diagnosis'
  },
  'Mortality': {
    fullName: 'Mortality',
    description: 'Risk of death within the prediction timeframe'
  }
};

export const RiskTableRow = ({ 
  risk, 
  timeframe,
  valueKey,
  currentRisks, 
  selectedRiskType, 
  allRisks,
  averageRisk,
  yAxisDomain,
  summary,
  onRemove,
  modelId
}: RiskTableRowProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const details = riskDetails[risk] || { 
    fullName: risk, 
    description: `Risk of ${risk.toLowerCase()}`
  };
  
  // Check if all values for this risk factor are null
  const displayKey = valueKey || risk;
  const hasValidRiskData = allRisks.some(r => getRiskValue(r, displayKey) !== null);

  const formatDate = (dateStr: string | undefined | null) => {
    if (!dateStr) return null;
    const date = parseISO(dateStr);
    const zonedDate = toZonedTime(date, 'America/New_York');
    return format(zonedDate, 'yyyy-MM-dd');
  };

  return (
    <>
      <TableRow className={`group ${hasValidRiskData ? 'cursor-pointer hover:bg-gray-50' : ''}`} onClick={() => hasValidRiskData && setIsExpanded(!isExpanded)}>
        <TableCell className="font-medium">
          <div className="flex items-start gap-2">
            {hasValidRiskData && (
              <div className="mt-1 text-gray-400">
                {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </div>
            )}
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-2">
                <span className="text-lg">{details.fullName}</span>
                {modelId && (
                  <a
                    href={`/phenom-builder/${modelId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                    title="View model"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
              {/* <span className="text-sm text-gray-500 font-normal">{details.description}</span> */}
            </div>
          </div>
        </TableCell>
        <TableCell className="whitespace-nowrap text-sm text-gray-600">{parseInt(timeframe)} year{timeframe !== '1' ? 's' : ''}</TableCell>
        <TableCell className="min-w-[220px]">
          <SparkLine 
            data={hasValidRiskData ? getRiskTrendData(allRisks, displayKey) : []}
            yAxisDomain={yAxisDomain}
            averageRisk={selectedRiskType === 'absolute' ? averageRisk : undefined}
            riskType={selectedRiskType}
          />
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className={`${isHighRisk(getRiskValue(currentRisks, displayKey), selectedRiskType) ? 'bg-red-100' : ''} px-2 py-1 rounded`}>
                  {formatRiskValue(getRiskValue(currentRisks, displayKey), selectedRiskType)}
                </span>
                <RiskChangeIndicator 
                  change={getChangeValue(currentRisks, displayKey)}
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
        {onRemove && (
          <TableCell className="w-10 text-right" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={onRemove}
              className="text-gray-400 hover:text-red-600"
              title="Remove row"
            >
              <X className="h-4 w-4" />
            </button>
          </TableCell>
        )}
      </TableRow>
      {hasValidRiskData && isExpanded && (
        <TableRow>
          <TableCell colSpan={5} className="bg-gray-50 pb-4 animate-accordion-down text-left">
            <div className="text-sm text-gray-700 p-2 border-l-2 border-blue-400 ml-8">
              <span className="font-medium text-blue-600">Risk Analysis: </span>
              {summary || <span className="italic text-gray-500">No Risk Analysis available</span>}
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
};
