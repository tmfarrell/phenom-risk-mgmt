
import { cn } from '@/lib/utils';
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group';
import { Label } from '../ui/label';
import { useAppVersion } from '@/hooks/useAppVersion';

interface RiskControlsProps {
  selectedTimeframe: string;
  selectedRiskType: 'relative' | 'absolute';
  onTimeframeChange: (value: string) => void;
  onRiskTypeChange: (value: 'relative' | 'absolute') => void;
  timeframes?: number[];
  hideTimeframe?: boolean;
}

export const RiskControls = ({
  selectedTimeframe,
  selectedRiskType,
  onTimeframeChange,
  onRiskTypeChange,
  timeframes = [1, 2],
  hideTimeframe = false
}: RiskControlsProps) => {
  const { appVersion } = useAppVersion();
  
  // Determine if we should show time periods in months
  const useMonthsForTimeframe = appVersion !== 'patient';
  
  // Calculate display values for timeframes
  const getTimeframeDisplay = (timeframe: string) => {
    const numericTimeframe = parseInt(timeframe);
    if (useMonthsForTimeframe) {
      const months = numericTimeframe * 12;
      return `${months} Month${months !== 1 ? 's' : ''}`;
    } else {
      return `${numericTimeframe} Year${numericTimeframe !== 1 ? 's' : ''}`;
    }
  };
  
  return (
    <div className="flex justify-start items-center gap-8 mb-4">
      <div className="flex flex-col gap-2">
        <Label className="text-sm text-gray-600 text-center mx-auto">Risk Type</Label>
        <ToggleGroup 
          type="single" 
          value={selectedRiskType}
          onValueChange={(value) => {
            if (value) onRiskTypeChange(value as 'relative' | 'absolute');
          }}
          className="flex gap-2"
        >
          <ToggleGroupItem 
            value="relative" 
            className={cn(
              "px-4 py-2 rounded-md",
              selectedRiskType === 'relative' ? "bg-blue-100 hover:bg-blue-200" : "hover:bg-gray-100"
            )}
          >
            Relative
          </ToggleGroupItem>
          <ToggleGroupItem 
            value="absolute"
            className={cn(
              "px-4 py-2 rounded-md",
              selectedRiskType === 'absolute' ? "bg-blue-100 hover:bg-blue-200" : "hover:bg-gray-100"
            )}
          >
            Absolute
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {!hideTimeframe && (
        <div className="flex flex-col gap-2">
          <Label className="text-sm text-gray-600 text-center mx-auto">Time Period</Label>
          <ToggleGroup 
            type="single" 
            value={selectedTimeframe}
            onValueChange={(value) => {
              if (value) onTimeframeChange(value);
            }}
            className="flex gap-2"
          >
            {timeframes.map((timeframe) => (
              <ToggleGroupItem 
                key={timeframe}
                value={timeframe.toString()} 
                className={cn(
                  "px-4 py-2 rounded-md",
                  selectedTimeframe === timeframe.toString() ? "bg-blue-100 hover:bg-blue-200" : "hover:bg-gray-100"
                )}
              >
                {getTimeframeDisplay(timeframe.toString())}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      )}
    </div>
  );
};
