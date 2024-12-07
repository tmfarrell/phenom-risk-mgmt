import { ResultsTable } from '@/components/ResultsTable';
import { Header } from '@/components/Header';
import { usePatientData } from '@/hooks/usePatientData';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useState } from 'react';
import { Person } from '@/types/population';

export default function Index() {
  const { data: patientData, isLoading, error } = usePatientData();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredData = patientData?.filter((patient: Person) => {
    const searchLower = searchQuery.toLowerCase();
    const nameMatch = patient.name?.toLowerCase().includes(searchLower);
    const mrnMatch = patient.mrn?.toString().includes(searchQuery);
    return nameMatch || mrnMatch;
  });

  if (error) {
    console.error('Error loading patient data:', error);
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-slate-50">
        <Header title="PhenOM Risk Management Dashboard" />
        <div className="p-6">
          <div className="max-w-[1600px] mx-auto">
            <div className="glass-card p-6">
              <p className="text-red-500">Error loading patient data. Please try again later.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-slate-50">
      <Header title="PhenOM Risk Management Dashboard" />
      <div className="p-6">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex flex-col space-y-6">
            <div className="glass-card p-6">
              <div className="flex justify-end mb-6">
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Search by name or MRN"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-[40px] w-full" />
                  <Skeleton className="h-[400px] w-full" />
                </div>
              ) : (
                <ResultsTable
                  data={filteredData || []}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}