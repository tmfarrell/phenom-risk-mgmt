import { useState } from 'react';
import { ResultsTable } from '@/components/ResultsTable';
import { DetailView } from '@/components/DetailView';
import { Person } from '@/types/population';
import { mockPeople } from '@/data/mockData';

export default function Index() {
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [filteredData, setFilteredData] = useState<Person[]>(mockPeople);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-slate-50 p-6">
      <div className="max-w-[1600px] mx-auto">
        <h1 className="text-3xl font-bold mb-6">Population Dashboard</h1>
        
        <div className="flex flex-col space-y-6">
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
}