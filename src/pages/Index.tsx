
import { ResultsTable } from '@/components/ResultsTable';
import { Header } from '@/components/Header';
import { TitleSection } from '@/components/TitleSection';
import { usePatientDataLatest } from '@/hooks/usePatientDataLatest';
import { Skeleton } from '@/components/ui/skeleton';
import { useState, useEffect } from 'react';
import { Person } from '@/types/population';
import { TableControls } from '@/components/table/TableControls';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { calculateAverageRisks } from '@/components/table/utils/riskCalculations';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { PopulationRiskDistribution } from '@/components/population/PopulationRiskDistribution';

export default function Index() {
  const { data: patientData, isLoading, error } = usePatientDataLatest();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRiskType, setSelectedRiskType] = useState<'relative' | 'absolute'>('relative');
  const [selectedRiskColumns, setSelectedRiskColumns] = useState<string[]>([
    'ED',
    'Hospitalization',
    'Fall',
    'Stroke',
    'MI',
  ]);
  const [selectedPatients, setSelectedPatients] = useState<Person[]>([]);
  const [showSelectedOnly, setShowSelectedOnly] = useState(false);
  const [viewMode, setViewMode] = useState<'patient' | 'population'>('patient');

  // Get unique time periods from the data, ensuring we have default values if data isn't loaded yet
  const timePeriods = patientData 
    ? [...new Set(patientData.filter(p => p.prediction_timeframe_yrs !== null).map(p => p.prediction_timeframe_yrs))]
    : [1, 5]; // Default time periods if data is not loaded
  
  // Make sure we have a valid initial timeframe selection
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('1');
  
  // Set the timeframe once data is loaded
  useEffect(() => {
    if (patientData && patientData.length > 0 && timePeriods.length > 0) {
      setSelectedTimeframe(timePeriods[0]?.toString() || '1');
    }
  }, [patientData]);

  // Calculate average risks from the full dataset
  const averageRisks = patientData ? calculateAverageRisks(patientData) : {};

  const filteredData = patientData?.filter((patient: Person) => {
    const searchLower = searchQuery.toLowerCase();
    const nameMatch = patient.name?.toLowerCase().includes(searchLower);
    const mrnMatch = patient.mrn?.toString().includes(searchQuery);
    const searchMatches = nameMatch || mrnMatch;

    const timeframeMatches = patient.prediction_timeframe_yrs === Number(selectedTimeframe);
    const riskTypeMatches = patient.risk_type === selectedRiskType;
    const selectedFilter = showSelectedOnly ? selectedPatients.some(p => p.patient_id === patient.patient_id) : true;

    return searchMatches && timeframeMatches && riskTypeMatches && selectedFilter;
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
              <div className="flex justify-end mb-4">
                <ToggleGroup 
                  type="single" 
                  value={viewMode}
                  onValueChange={(value) => {
                    if (value) setViewMode(value as 'patient' | 'population');
                  }}
                  className="border rounded-lg"
                >
                  <ToggleGroupItem 
                    value="patient" 
                    className="px-4 py-2 data-[state=on]:bg-primary data-[state=on]:text-white"
                  >
                    Patient
                  </ToggleGroupItem>
                  <ToggleGroupItem 
                    value="population"
                    className="px-4 py-2 data-[state=on]:bg-primary data-[state=on]:text-white"
                  >
                    Population
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>

              {viewMode === 'patient' ? (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <TableControls
                      searchQuery={searchQuery}
                      onSearchChange={setSearchQuery}
                      selectedTimeframe={selectedTimeframe}
                      onTimeframeChange={setSelectedTimeframe}
                      selectedRiskColumns={selectedRiskColumns}
                      onRiskColumnsChange={setSelectedRiskColumns}
                      timeframes={timePeriods.length > 0 ? timePeriods as number[] : [1, 5]}
                      selectedRiskType={selectedRiskType}
                      onRiskTypeChange={setSelectedRiskType}
                    />
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="show-selected"
                        checked={showSelectedOnly}
                        onCheckedChange={setShowSelectedOnly}
                      />
                      <Label htmlFor="show-selected">Only show selected patients</Label>
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
                      visibleRiskColumns={selectedRiskColumns}
                      onSelectionChange={setSelectedPatients}
                      averageRisks={averageRisks}
                      selectedTimeframe={selectedTimeframe}
                    />
                  )}
                </>
              ) : (
                <PopulationRiskDistribution
                  selectedTimeframe={selectedTimeframe}
                  selectedRiskType={selectedRiskType}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
