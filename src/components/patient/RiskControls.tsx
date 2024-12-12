import { cn } from '@/lib/utils';
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group';

interface RiskControlsProps {
  selectedTimeframe: string;
  selectedRiskType: 'relative' | 'absolute';
  onTimeframeChange: (value: string) => void;
  onRiskTypeChange: (value: 'relative' | 'absolute') => void;
}

export const RiskControls = ({
  selectedTimeframe,
  selectedRiskType,
  onTimeframeChange,
  onRiskTypeChange,
}: RiskControlsProps) => {
  return (
    <div className="flex justify-end items-center gap-4 mb-4">
      <ToggleGroup 
        type="single" 
        value={selectedTimeframe}
        onValueChange={(value) => {
          if (value) onTimeframeChange(value);
        }}
        className="flex gap-2"
      >
        <ToggleGroupItem 
          value="1" 
          className={cn(
            "px-4 py-2 rounded-md",
            selectedTimeframe === '1' ? "bg-blue-100 hover:bg-blue-200" : "hover:bg-gray-100"
          )}
        >
          1 Year
        </ToggleGroupItem>
        <ToggleGroupItem 
          value="5"
          className={cn(
            "px-4 py-2 rounded-md",
            selectedTimeframe === '5' ? "bg-blue-100 hover:bg-blue-200" : "hover:bg-gray-100"
          )}
        >
          5 Years
        </ToggleGroupItem>
      </ToggleGroup>

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
  );
};