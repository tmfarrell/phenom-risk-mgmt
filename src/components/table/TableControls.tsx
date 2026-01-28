import React from 'react';
import { Search, Check, HelpCircle, ChevronDown, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Input } from '../ui/input';
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
import { Label } from '../ui/label';
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { RISK_COLUMNS, DISABLED_RISK_COLUMNS } from './tableConstants';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '../ui/tooltip';
import { useAppVersion } from '@/hooks/useAppVersion';

interface ProviderList {
  availableList: string[];
  selectedList: string[];
}

interface TableControlsProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedTimeframe: string;
  onTimeframeChange: (value: string) => void;
  selectedRiskColumns: string[];
  onRiskColumnsChange: (value: string[]) => void;
  timeframes: Array<number | 'today'>;
  selectedRiskType: 'relative' | 'absolute';
  onRiskTypeChange: (value: 'relative' | 'absolute') => void;
  providerList: ProviderList;
  onProviderSelection: (providerList: ProviderList) => void;
  showSelectedOnly: boolean;
  onShowSelectedOnlyChange: (value: boolean) => void;
  availableOutcomes?: string[]; // Dynamic outcomes from phenom_models
  availableModels?: Array<{outcome: string, modelId: string}>; // Model info for each outcome
  outcomeLabels?: Record<string, string>; // Map from indication_code -> model_name
  hideTimePeriod?: boolean; // Hide the Time Period dropdown
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
  providerList,
  onProviderSelection,
  showSelectedOnly,
  onShowSelectedOnlyChange,
  availableOutcomes = [],
  availableModels = [],
  outcomeLabels,
  hideTimePeriod = false,
}: TableControlsProps) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [providerOpen, setProviderOpen] = useState(false);
  const [riskTypeOpen, setRiskTypeOpen] = useState(false);
  const [timeframeOpen, setTimeframeOpen] = useState(false);
  const { appVersion } = useAppVersion();
  
  // Helper function to format timeframe display
  const formatTimeframe = (timeframe: number) => {
    if (timeframe < 1) {
      // Show in months for timeframes less than 1 year
      const months = timeframe * 12;
      return `${months} month${months !== 1 ? 's' : ''}`;
    } else {
      // Show in years for timeframes >= 1 year
      return `${timeframe} year${timeframe !== 1 ? 's' : ''}`;
    }
  };
  
  // Ensure we always have an array to work with
  const currentSelectedColumns = Array.isArray(selectedRiskColumns) ? selectedRiskColumns : [];

  return (
    <div className="flex justify-start items-end gap-8 mb-8">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-1 justify-center w-full">
          <Label htmlFor="risk-type" className="text-center text-muted-foreground">Risk Type</Label>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-4 w-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent className="max-w-[300px] space-y-2">
              <p>Relative risk is risk compared to the average in the cohort over the time period.</p>
              <p>Absolute risk is the chances that event will occur in the time period.</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <Popover open={riskTypeOpen} onOpenChange={setRiskTypeOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={riskTypeOpen}
              className="w-28 justify-between"
              id="risk-type"
            >
              {selectedRiskType === 'relative' ? 'Relative' : 'Absolute'}
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-28 p-0">
            <Command>
              <CommandList>
                <CommandGroup>
                  <CommandItem
                    value="relative"
                    onSelect={() => {
                      onRiskTypeChange('relative');
                      setRiskTypeOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedRiskType === 'relative' ? "opacity-100" : "opacity-0"
                      )}
                    />
                    Relative
                  </CommandItem>
                  <CommandItem
                    value="absolute"
                    onSelect={() => {
                      onRiskTypeChange('absolute');
                      setRiskTypeOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedRiskType === 'absolute' ? "opacity-100" : "opacity-0"
                      )}
                    />
                    Absolute
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {!hideTimePeriod && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="risk-timeframe" className="text-center text-muted-foreground mx-auto">Time Period</Label>
          <Popover open={timeframeOpen} onOpenChange={setTimeframeOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={timeframeOpen}
                className="w-28 justify-between"
                id="risk-timeframe"
              >
                {selectedTimeframe === 'today'
                  ? 'Today'
                  : formatTimeframe(parseFloat(selectedTimeframe))}
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-28 p-0">
              <Command>
                <CommandList>
                  <CommandGroup>
                    {timeframes.map((timeframe) => {
                      if (timeframe === 'today') {
                        return (
                          <CommandItem
                            key={'today'}
                            value={'today'}
                            onSelect={() => {
                              onTimeframeChange('today');
                              setTimeframeOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedTimeframe === 'today' ? "opacity-100" : "opacity-0"
                              )}
                            />
                            Today
                          </CommandItem>
                        );
                      }
                      const numeric = timeframe as number;
                      return (
                        <CommandItem
                          key={numeric}
                          value={numeric.toString()}
                          onSelect={() => {
                            onTimeframeChange(numeric.toString());
                            setTimeframeOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedTimeframe === numeric.toString() ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {formatTimeframe(numeric)}
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor="risk-factors" className="text-center text-muted-foreground mx-auto">Outcomes</Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-48 justify-between"
              id="risk-factors"
            >
              Select outcomes
              <Badge variant="secondary" className="ml-2">
                {currentSelectedColumns.length}
              </Badge>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-0">
            <Command>
              <CommandInput placeholder="Search" />
              <CommandList>
                <CommandEmpty>No column found.</CommandEmpty>
                <CommandGroup>
                  {/* Use availableOutcomes if provided, otherwise fall back to RISK_COLUMNS; sort by display label */}
                  {(() => {
                    const options = (availableOutcomes.length > 0 ? availableOutcomes : RISK_COLUMNS).slice();
                    options.sort((a, b) => {
                      const aLabel = outcomeLabels?.[a] || a;
                      const bLabel = outcomeLabels?.[b] || b;
                      return aLabel.localeCompare(bLabel);
                    });
                    return options;
                  })().map((column) => {
                    const modelInfo = availableModels.find(m => m.outcome === column);
                    const label = outcomeLabels?.[column] || column;
                    return (
                      <CommandItem
                        key={column}
                        value={column}
                        onSelect={() => {
                          const newSelection = currentSelectedColumns.includes(column)
                            ? currentSelectedColumns.filter((c) => c !== column)
                            : [...currentSelectedColumns, column];
                          onRiskColumnsChange(newSelection);
                        }}
                        className="group"
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            currentSelectedColumns.includes(column) ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <span className="flex-1">{label}</span>
                        {modelInfo && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              navigate(`/phenom-builder/${modelInfo.modelId}`);
                            }}
                            className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            title="View model details"
                          >
                            <ExternalLink className="h-3 w-3 text-gray-500 hover:text-blue-600" />
                          </button>
                        )}
                      </CommandItem>
                    );
                  })}
                  {/* Only show disabled columns if we're using the fallback RISK_COLUMNS */}
                  {availableOutcomes.length === 0 && DISABLED_RISK_COLUMNS.map((column) => (
                    <CommandItem
                      key={column}
                      value={column}
                      disabled
                      className="opacity-50 cursor-not-allowed"
                    >
                      <Check className="mr-2 h-4 w-4 opacity-0" />
                      {column}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {appVersion === 'patient' && (
        <div className='flex flex-col gap-2'>
          <Label htmlFor='provider' className='text-center text-muted-foreground mx-auto'>
            Provider
          </Label>
          <Popover open={providerOpen} onOpenChange={setProviderOpen}>
            <PopoverTrigger asChild>
              <Button variant='outline' role='combobox' aria-expanded={providerOpen} className='w-48 justify-between' id='provider'>
                Select providers
                <Badge variant='secondary' className='ml-2'>
                  {Array.isArray(providerList?.selectedList) && providerList?.selectedList?.length > 0 ? providerList.selectedList.length : 'All'}
                </Badge>
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-48 p-0'>
              <Command>
                <CommandInput placeholder='Search providers...' />
                <CommandList>
                  <CommandEmpty>No provider found.</CommandEmpty>
                  <CommandGroup>
                    {providerList?.availableList.map((provider) => (
                      <CommandItem
                        key={provider}
                        onSelect={() => {
                          const selected = Array.isArray(providerList?.selectedList) ? providerList.selectedList : []
                          const newSelection = selected.includes(provider)
                            ? selected.filter((p) => p !== provider)
                            : [...selected, provider]

                          const updatedProviderList = {
                            ...providerList,
                            selectedList: newSelection
                          }

                          onProviderSelection(updatedProviderList)
                        }}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            providerList?.selectedList.includes(provider) ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                        {provider}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor="search" className="text-center text-muted-foreground mx-auto">Search</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
          <Input
            id="search"
            type="text"
            placeholder="Patient name or ID"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="show-selected"
          checked={showSelectedOnly}
          onCheckedChange={onShowSelectedOnlyChange}
        />
        <Label htmlFor="show-selected">Only selected patients</Label>
      </div>
    </div>
  );
};
