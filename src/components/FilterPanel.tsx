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

  const handleAgeRangeChange = (index: number, value: number) => {
    const newAgeRange = [...filters.ageRange] as [number, number];
    if (index === 0) {
      // Left endpoint (minimum age)
      newAgeRange[0] = Math.min(value, newAgeRange[1]);
    } else {
      // Right endpoint (maximum age)
      newAgeRange[1] = Math.max(value, newAgeRange[0]);
    }
    setFilters({ ...filters, ageRange: newAgeRange });
  };

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
    <Card className="p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-4">Filter Population</h2>
        
        <div className="space-y-4">
          <div className="space-y-4">
            <div>
              <Label>Minimum Age: {filters.ageRange[0]}</Label>
              <Slider
                min={20}
                max={60}
                step={1}
                value={[filters.ageRange[0]]}
                onValueChange={(value) => handleAgeRangeChange(0, value[0])}
              />
            </div>
            <div>
              <Label>Maximum Age: {filters.ageRange[1]}</Label>
              <Slider
                min={20}
                max={60}
                step={1}
                value={[filters.ageRange[1]]}
                onValueChange={(value) => handleAgeRangeChange(1, value[0])}
              />
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

        <div className="flex gap-2 mt-6">
          <Button onClick={handleApplyFilters} className="flex-1">
            Apply Filters
          </Button>
          <Button onClick={handleReset} variant="outline" className="flex-1">
            Reset
          </Button>
        </div>
      </div>
    </Card>
  );
};