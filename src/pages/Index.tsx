import { ResultsTable } from '@/components/ResultsTable';
import { Header } from '@/components/Header';
import { TitleSection } from '@/components/TitleSection';
import { usePatientData } from '@/hooks/usePatientData';
import { Skeleton } from '@/components/ui/skeleton';
import { useState } from 'react';
import { Person } from '@/types/population';

export default function Index() {
  const { data: patientData, isLoading, error } = usePatientData();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('1');
  const [selectedRiskType, setSelectedRiskType] = useState<'relative' | 'absolute'>('relative');
  const [selectedRiskColumns, setSelectedRiskColumns] = useState<string[]>([
    'ED',
    'Hospitalization',
    'Fall',
    'Stroke',
    'MI',
  ]);

  // Get unique timeframes from the data and ensure they are valid numbers
  const timeframes = [1, 5];

  const filteredData = patientData?.filter((patient: Person) => {
    // First filter by search query
    const searchLower = searchQuery.toLowerCase();
    const nameMatch = patient.name?.toLowerCase().includes(searchLower);
    const mrnMatch = patient.mrn?.toString().includes(searchQuery);
    const searchMatches = nameMatch || mrnMatch;

    // Then filter by selected timeframe and risk type
    const timeframeMatches = patient.prediction_timeframe_yrs === Number(selectedTimeframe);
    const riskTypeMatches = patient.risk_type === selectedRiskType;

    return searchMatches && timeframeMatches && riskTypeMatches;
  });

  if (error) {
    console.error('Error loading patient data:', error);
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-slate-50">
        <Header />
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
      <Header />
      <TitleSection title="PhenOM Risk Management Dashboard" />
      <div className="p-6">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex flex-col space-y-6">
            <div className="glass-card p-6">
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-[40px] w-full" />
                  <Skeleton className="h-[400px] w-full" />
                </div>
              ) : (
                <ResultsTable
                  data={filteredData || []}
                  visibleRiskColumns={selectedRiskColumns}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}