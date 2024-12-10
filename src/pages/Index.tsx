import { ResultsTable } from '@/components/ResultsTable';
import { Header } from '@/components/Header';
import { TitleSection } from '@/components/TitleSection';
import { usePatientData } from '@/hooks/usePatientData';
import { Skeleton } from '@/components/ui/skeleton';
import { useState } from 'react';
import { Person } from '@/types/population';
import { TableControls } from '@/components/table/TableControls';
import { Button } from '@/components/ui/button';
import { PanelTopOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
  const [selectedPatients, setSelectedPatients] = useState<Person[]>([]);
  const navigate = useNavigate();

  const handleViewPanel = () => {
    navigate('/panel', { state: { selectedPatients } });
  };

  const filteredData = patientData?.filter((patient: Person) => {
    const searchLower = searchQuery.toLowerCase();
    const nameMatch = patient.name?.toLowerCase().includes(searchLower);
    const mrnMatch = patient.mrn?.toString().includes(searchQuery);
    const searchMatches = nameMatch || mrnMatch;

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
              <div className="flex justify-between items-center mb-4">
                <TableControls
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  selectedTimeframe={selectedTimeframe}
                  onTimeframeChange={setSelectedTimeframe}
                  selectedRiskColumns={selectedRiskColumns}
                  onRiskColumnsChange={setSelectedRiskColumns}
                  timeframes={[1, 5]}
                  selectedRiskType={selectedRiskType}
                  onRiskTypeChange={setSelectedRiskType}
                />
                <Button
                  onClick={handleViewPanel}
                  className={`ml-4 ${selectedPatients.length > 0 ? 'bg-blue-500 hover:bg-blue-600' : ''}`}
                  disabled={selectedPatients.length === 0}
                >
                  <PanelTopOpen className="mr-2 h-4 w-4" />
                  View Panel
                </Button>
              </div>
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-[40px] w-full" />
                  <Skeleton className="h-[400px] w-full" />
                </div>
              ) : (
                <ResultsTable
                  data={filteredData || []}
                  visibleRiskColumns={selectedRiskColumns}
                  onSelectionChange={setSelectedPatients}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}