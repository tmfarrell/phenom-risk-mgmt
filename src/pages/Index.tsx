import { useState } from 'react';
import { FilterPanel } from '@/components/FilterPanel';
import { ResultsTable } from '@/components/ResultsTable';
import { DetailView } from '@/components/DetailView';
import { FilterCriteria, Person } from '@/types/population';
import { mockPeople } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export default function Index() {
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [filteredData, setFilteredData] = useState<Person[]>(mockPeople);
  const [timeRange, setTimeRange] = useState('1year');
  const [riskType, setRiskType] = useState('relative');

  const handleFilterChange = (filters: FilterCriteria) => {
    const filtered = mockPeople.filter((person) => {
      const ageMatch =
        person.age >= filters.ageRange[0] && 
        (filters.ageRange[1] === 100 ? true : person.age <= filters.ageRange[1]);
      const genderMatch =
        filters.gender.length === 0 || filters.gender.includes(person.gender);
      const locationMatch =
        filters.location.length === 0 ||
        filters.location.includes(person.location);
      const occupationMatch =
        filters.occupation.length === 0 ||
        filters.occupation.includes(person.occupation);

      return ageMatch && genderMatch && locationMatch && occupationMatch;
    });

    setFilteredData(filtered);
  };

  return (
    <div className="min-h-screen bg-[url('/lovable-uploads/a3514074-f3b8-42ee-9f16-3ec30120482a.png')] bg-cover bg-center">
      <header className="bg-white/90 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src="/og-image.svg" alt="Logo" className="h-8" />
            <span className="text-lg font-semibold">PhenOM</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost">About</Button>
            <Button variant="ghost">Help</Button>
            <div className="h-6 w-px bg-gray-200"></div>
            <Button variant="ghost">Welcome, User</Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
          <h1 className="text-2xl font-semibold text-center">Patient Risk Management Report</h1>
          <p className="text-sm text-gray-500 text-center">Medicine Advantage Plan (All)</p>

          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <Button 
                variant={riskType === 'relative' ? 'default' : 'outline'}
                onClick={() => setRiskType('relative')}
                className="rounded-full"
              >
                Relative Risk
              </Button>
              <Button 
                variant={riskType === 'absolute' ? 'default' : 'outline'}
                onClick={() => setRiskType('absolute')}
                className="rounded-full"
              >
                Absolute Risk
              </Button>
              <Button variant="outline" className="rounded-full">
                {timeRange === '1year' ? '1 year' : timeRange}
                <span className="ml-2">▼</span>
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input 
                placeholder="Search (Name, MRN, Date)" 
                className="pl-10 w-[300px] rounded-full"
              />
            </div>
          </div>

          <FilterPanel onFilterChange={handleFilterChange} />
          
          <div className="space-y-6">
            <div className="glass-card">
              <ResultsTable
                data={filteredData}
                onSelectPerson={setSelectedPerson}
              />
            </div>
            
            <DetailView person={selectedPerson} />
          </div>
        </div>
      </div>
    </div>
  );
}