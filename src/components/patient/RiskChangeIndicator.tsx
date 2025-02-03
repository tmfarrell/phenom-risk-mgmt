import { ArrowUp, ArrowDown } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { formatChangeValue, getArrowColor } from './utils/riskUtils';
import { parseISO } from 'date-fns';
import { format } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';

interface RiskChangeIndicatorProps {
  change: number | null;
  selectedRiskType: 'relative' | 'absolute';
  changeSince?: string | null;
}

export const RiskChangeIndicator = ({ 
  change, 
  selectedRiskType,
  changeSince 
}: RiskChangeIndicatorProps) => {
  if (!change || Math.abs(change) <= (selectedRiskType === 'absolute' ? 0.25 : 0.1)) return null;

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return 'unknown date';
    const date = parseISO(dateStr);
    const zonedDate = utcToZonedTime(date, 'America/New_York');
    return format(zonedDate, 'yyyy-MM-dd');
  };

  const tooltipText = `${change > 0 ? '+' : ''}${formatChangeValue(change, selectedRiskType)} change from ${formatDate(changeSince)}`;
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