import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface ViewToggleProps {
  selectedView: 'patient' | 'population';
  onViewChange: (view: 'patient' | 'population') => void;
}

export const ViewToggle = ({ selectedView, onViewChange }: ViewToggleProps) => {
  return (
    <div className="flex flex-col gap-2">
      <Label className="text-sm text-gray-600 text-center mx-auto">View Mode</Label>
      <ToggleGroup 
        type="single" 
        value={selectedView}
        onValueChange={(value) => {
          if (value) onViewChange(value as 'patient' | 'population');
        }}
        className="flex gap-2"
      >
        <ToggleGroupItem 
          value="patient" 
          className={cn(
            "px-4 py-2 rounded-md",
            selectedView === 'patient' ? "bg-blue-100 hover:bg-blue-200" : "hover:bg-gray-100"
          )}
        >
          Patient
        </ToggleGroupItem>
        <ToggleGroupItem 
          value="population"
          className={cn(
            "px-4 py-2 rounded-md",
            selectedView === 'population' ? "bg-blue-100 hover:bg-blue-200" : "hover:bg-gray-100"
          )}
        >
          Population
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
};