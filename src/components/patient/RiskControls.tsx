
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group';
import { useVersionLabels } from '@/hooks/useVersionLabels';

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
  onRiskTypeChange
}: RiskControlsProps) => {
  const { formatTimePeriodWithUnit } = useVersionLabels();
  
  return (
    <div className="flex justify-between items-center mb-4">
      <div className="flex items-center gap-4">
        <div>
          <Label htmlFor="prediction-timeframe" className="mb-2 block">Prediction Timeframe</Label>
          <Select 
            value={selectedTimeframe} 
            onValueChange={onTimeframeChange}
          >
            <SelectTrigger className="w-[180px]" id="prediction-timeframe">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0.5">{formatTimePeriodWithUnit(0.5)}</SelectItem>
              <SelectItem value="1">{formatTimePeriodWithUnit(1)}</SelectItem>
              <SelectItem value="3">{formatTimePeriodWithUnit(3)}</SelectItem>
              <SelectItem value="5">{formatTimePeriodWithUnit(5)}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label className="mb-2 block">Risk View</Label>
          <ToggleGroup 
            type="single" 
            value={selectedRiskType}
            onValueChange={(value) => {
              if (value) onRiskTypeChange(value as 'relative' | 'absolute');
            }}
            className="border rounded-md"
          >
            <ToggleGroupItem 
              value="relative" 
              className="px-4 bg-white data-[state=on]:bg-blue-100"
            >
              Relative
            </ToggleGroupItem>
            <ToggleGroupItem 
              value="absolute"
              className="px-4 bg-white data-[state=on]:bg-blue-100"
            >
              Absolute
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>
    </div>
  );
};
