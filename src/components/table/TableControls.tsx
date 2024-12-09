import { Search } from 'lucide-react';
import { Input } from '../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { RISK_COLUMNS } from './tableConstants';
import { Badge } from '../ui/badge';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '../ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../ui/popover';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { useState } from 'react';
import { Check } from 'lucide-react';
import { Label } from '../ui/label';
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group';

interface TableControlsProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedTimeframe: string;
  onTimeframeChange: (value: string) => void;
  selectedRiskColumns: string[];
  onRiskColumnsChange: (value: string[]) => void;
  timeframes: number[];
  selectedRiskType: 'relative' | 'absolute';
  onRiskTypeChange: (value: 'relative' | 'absolute') => void;
}

export const TableControls = ({
  searchQuery,
  onSearchChange,
  selectedTimeframe,
  onTimeframeChange,
  selectedRiskColumns = [],
  onRiskColumnsChange,
  timeframes,
  selectedRiskType,
  onRiskTypeChange,
}: TableControlsProps) => {
  const [open, setOpen] = useState(false);
  
  // Ensure we always have an array to work with
  const currentSelectedColumns = Array.isArray(selectedRiskColumns) ? selectedRiskColumns : [];

  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex gap-8">
        <div className="flex flex-col gap-2">
          <Label htmlFor="risk-type" className="text-center text-muted-foreground">Risk Type</Label>
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
          <Label htmlFor="risk-timeframe" className="text-center text-muted-foreground">Risk Timeframe</Label>
          <Select
            value={selectedTimeframe}
            onValueChange={onTimeframeChange}
          >
            <SelectTrigger id="risk-timeframe" className="w-48">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              {timeframes.map((timeframe) => (
                <SelectItem 
                  key={timeframe} 
                  value={timeframe.toString()}
                >
                  {timeframe} years
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="risk-factors" className="text-center text-muted-foreground">Risk Factors</Label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-48 justify-between"
                id="risk-factors"
              >
                Select conditions
                <Badge variant="secondary" className="ml-2">
                  {currentSelectedColumns.length}
                </Badge>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-0">
              <Command>
                <CommandInput placeholder="Search conditions..." />
                <CommandList>
                  <CommandEmpty>No column found.</CommandEmpty>
                  <CommandGroup>
                    {RISK_COLUMNS.map((column) => (
                      <CommandItem
                        key={column}
                        value={column}
                        onSelect={() => {
                          const newSelection = currentSelectedColumns.includes(column)
                            ? currentSelectedColumns.filter((c) => c !== column)
                            : [...currentSelectedColumns, column];
                          onRiskColumnsChange(newSelection);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            currentSelectedColumns.includes(column) ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {column}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="search" className="text-center text-muted-foreground">Search</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
          <Input
            id="search"
            type="text"
            placeholder="Patient name or MRN"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>
    </div>
  );
};