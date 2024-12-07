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

interface TableControlsProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedTimeframe: string;
  onTimeframeChange: (value: string) => void;
  selectedRiskColumns: string[];
  onRiskColumnsChange: (value: string[]) => void;
  timeframes: number[];
}

export const TableControls = ({
  searchQuery,
  onSearchChange,
  selectedTimeframe,
  onTimeframeChange,
  selectedRiskColumns = [], // Provide default empty array
  onRiskColumnsChange,
  timeframes,
}: TableControlsProps) => {
  const [open, setOpen] = useState(false);

  console.log('TableControls render:', { selectedRiskColumns }); // Debug log

  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex gap-4">
        <Select
          value={selectedTimeframe}
          onValueChange={onTimeframeChange}
        >
          <SelectTrigger className="w-48">
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

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-48 justify-between"
            >
              Select columns
              <Badge variant="secondary" className="ml-2">
                {(selectedRiskColumns || []).length}
              </Badge>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-0">
            <Command>
              <CommandInput placeholder="Search columns..." className="h-9" />
              <CommandEmpty>No column found.</CommandEmpty>
              <CommandGroup>
                {RISK_COLUMNS.map((column) => (
                  <CommandItem
                    key={column}
                    onSelect={() => {
                      const newSelection = selectedRiskColumns.includes(column)
                        ? selectedRiskColumns.filter((c) => c !== column)
                        : [...selectedRiskColumns, column];
                      onRiskColumnsChange(newSelection);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedRiskColumns.includes(column) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {column}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
        <Input
          type="text"
          placeholder="Search by name or MRN"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
    </div>
  );
};