import { useState } from 'react';
import { FilterPanel } from '@/components/FilterPanel';
import { ResultsTable } from '@/components/ResultsTable';
import { DetailView } from '@/components/DetailView';
import { FilterCriteria, Person } from '@/types/population';
import { mockPeople } from '@/data/mockData';

const Index = () => {
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [filteredData, setFilteredData] = useState<Person[]>(mockPeople);

  const handleFilterChange = (filters: FilterCriteria) => {
    const filtered = mockPeople.filter((person) => {
      const ageMatch =
        person.age >= filters.ageRange[0] && person.age <= filters.ageRange[1];
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-slate-50 p-6">
      <div className="max-w-[1600px] mx-auto">
        <h1 className="text-3xl font-bold mb-6">Population Dashboard</h1>
        
        <div className="flex flex-col space-y-6">
          <FilterPanel onFilterChange={handleFilterChange} />
          
          <div className="space-y-6">
            <div className="glass-card p-6">
              <h2 className="text-lg font-semibold mb-4">Results</h2>
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
};

export default Index;