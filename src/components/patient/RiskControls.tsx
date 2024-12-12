import { cn } from '@/lib/utils';
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group';
import { Label } from '../ui/label';

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
    <div className="flex justify-end items-center gap-8 mb-4">
      <div className="flex flex-col gap-2">
        <Label className="text-sm text-gray-600">Risk Type</Label>
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

      <div className="flex flex-col gap-2">
        <Label className="text-sm text-gray-600">Time Frame</Label>
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
      </div>
    </div>
  );
};