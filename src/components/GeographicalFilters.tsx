import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Filter, RotateCcw, Check, ChevronsUpDown, X } from 'lucide-react';

interface GeographicalFilterValues {
  groupingLevel: 'state' | 'city' | 'zipcode';
  states: string[];
}

interface GeographicalFiltersProps {
  onCollapseChange: (collapsed: boolean) => void;
  hasNpiFile: boolean;
  filters: GeographicalFilterValues;
  onFiltersChange: (filters: GeographicalFilterValues) => void;
}

const defaultFilters: GeographicalFilterValues = {
  groupingLevel: 'zipcode',
  states: []
};

// US States list
const US_STATES = [
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' },
  { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' },
  { code: 'DE', name: 'Delaware' },
  { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' },
];

const GeographicalFilters: React.FC<GeographicalFiltersProps> = ({
  onCollapseChange,
  hasNpiFile,
  filters,
  onFiltersChange
}) => {
  const [isCollapsed, setIsCollapsed] = React.useState(true);
  const [statePopoverOpen, setStatePopoverOpen] = React.useState(false);

  const handleCollapseToggle = () => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    onCollapseChange(newCollapsed);
  };

  const handleResetFilters = () => {
    onFiltersChange(defaultFilters);
  };

  return (
    <div className="relative">
      <Card className={`transition-all duration-300 ${isCollapsed ? 'w-12' : 'w-80'}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <Filter className="h-4 w-4" />
            {!isCollapsed && (
              <div className="flex items-center justify-between w-full">
                <CardTitle className="flex items-center gap-2 text-base">
                  Filters
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetFilters}
                  className="h-6 px-2 text-xs"
                >
                  <RotateCcw className="h-3 w-3" />
                </Button>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCollapseToggle}
              className={`h-8 w-8 p-0 ${isCollapsed ? 'absolute top-2 right-2' : ''}`}
            >
              {isCollapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>

        {!isCollapsed && (
          <CardContent className="space-y-6 max-h-[600px] overflow-y-auto">
            {/* Grouping Level */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Grouping Level</Label>
              <Select
                value={filters.groupingLevel}
                onValueChange={(value: any) => onFiltersChange({ ...filters, groupingLevel: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="state">State</SelectItem>
                  <SelectItem value="city">City</SelectItem>
                  <SelectItem value="zipcode">Zip Code</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* State Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Filter by State</Label>
              <Popover open={statePopoverOpen} onOpenChange={setStatePopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={statePopoverOpen}
                    className="w-full justify-between h-auto min-h-[36px] py-2"
                  >
                    <div className="flex flex-wrap gap-1 flex-1">
                      {filters.states && filters.states.length > 0 ? (
                        filters.states.map((stateCode) => {
                          const state = US_STATES.find(s => s.code === stateCode);
                          return (
                            <Badge
                              key={stateCode}
                              variant="secondary"
                              className="text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                const newStates = filters.states.filter(s => s !== stateCode);
                                onFiltersChange({ ...filters, states: newStates });
                              }}
                            >
                              {state?.code}
                              <X className="ml-1 h-3 w-3" />
                            </Badge>
                          );
                        })
                      ) : (
                        <span className="text-muted-foreground">Select states...</span>
                      )}
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[280px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search states..." />
                    <CommandList>
                      <CommandEmpty>No state found.</CommandEmpty>
                      <CommandGroup>
                        {US_STATES.map((state) => {
                          const isSelected = filters.states && filters.states.includes(state.code);
                          return (
                            <CommandItem
                              key={state.code}
                              value={`${state.code} ${state.name}`}
                              onSelect={() => {
                                const newStates = isSelected
                                  ? filters.states.filter(s => s !== state.code)
                                  : [...(filters.states || []), state.code];
                                onFiltersChange({ ...filters, states: newStates });
                              }}
                            >
                              <Check
                                className={`mr-2 h-4 w-4 ${
                                  isSelected ? 'opacity-100' : 'opacity-0'
                                }`}
                              />
                              <span className="flex-1">{state.name}</span>
                              <span className="text-xs text-muted-foreground">{state.code}</span>
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {filters.states && filters.states.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onFiltersChange({ ...filters, states: [] })}
                  className="h-7 px-2 text-xs w-full"
                >
                  Clear All ({filters.states.length})
                </Button>
              )}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default GeographicalFilters;