import { ArrowUp, ArrowDown } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { formatChangeValue, getArrowColor } from './utils/riskUtils';

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
  if (!change || Math.abs(change) <= (selectedRiskType === 'absolute' ? 5 : 0.3)) return null;

  const tooltipText = `${formatChangeValue(change, selectedRiskType)} change from ${changeSince || 'unknown date'}`;
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