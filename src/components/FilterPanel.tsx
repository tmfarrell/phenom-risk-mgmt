import { useState } from 'react';
import { Card } from './ui/card';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Button } from './ui/button';
import { FilterCriteria } from '../types/population';
import { locations, occupations } from '../data/mockData';

interface FilterPanelProps {
  onFilterChange: (filters: FilterCriteria) => void;
}

export const FilterPanel = ({ onFilterChange }: FilterPanelProps) => {
  const [filters, setFilters] = useState<FilterCriteria>({
    ageRange: [20, 60],
    gender: [],
    location: [],
    occupation: [],
  });

  const handleApplyFilters = () => {
    onFilterChange(filters);
  };

  const handleReset = () => {
    const resetFilters: FilterCriteria = {
      ageRange: [20, 60],
      gender: [],
      location: [],
      occupation: [],
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  return (
    <Card className="p-4">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Filter Population</h2>
          <div className="flex gap-2">
            <Button onClick={handleApplyFilters} size="sm">
              Apply Filters
            </Button>
            <Button onClick={handleReset} variant="outline" size="sm">
              Reset
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="space-y-2">
            <Label>Age Range</Label>
            <Slider
              min={20}
              max={60}
              step={1}
              value={filters.ageRange}
              onValueChange={(value) =>
                setFilters({ ...filters, ageRange: value as [number, number] })
              }
            />
            <div className="flex justify-between text-sm text-gray-500">
              <span>{filters.ageRange[0]}</span>
              <span>{filters.ageRange[1]}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Gender</Label>
            <Select
              onValueChange={(value) =>
                setFilters({ ...filters, gender: [value] })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Location</Label>
            <Select
              onValueChange={(value) =>
                setFilters({ ...filters, location: [value] })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Occupation</Label>
            <Select
              onValueChange={(value) =>
                setFilters({ ...filters, occupation: [value] })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select occupation" />
              </SelectTrigger>
              <SelectContent>
                {occupations.map((occupation) => (
                  <SelectItem key={occupation} value={occupation}>
                    {occupation}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </Card>
  );
};