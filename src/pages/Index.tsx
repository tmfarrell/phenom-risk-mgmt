import { ResultsTable } from '@/components/ResultsTable';
import { Header } from '@/components/Header';
import { TitleSection } from '@/components/TitleSection';
import { usePatientDataLatest } from '@/hooks/usePatientDataLatest';
import { Skeleton } from '@/components/ui/skeleton';
import { useState, useEffect } from 'react';
import { Person } from '@/types/population';
import { TableControls } from '@/components/table/TableControls';
import { calculateAverageRisks } from '@/components/table/utils/riskCalculations';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { PopulationRiskDistribution } from '@/components/population/PopulationRiskDistribution';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLocation, useNavigate } from 'react-router-dom';

// Mock providers for testing
const PROVIDERS = ['Provider A', 'Provider B', 'Provider C'];

interface ProviderList {
  availableList: string[];
  selectedList: string[];
}

export interface IndexPageState {
  searchQuery: string;
  selectedRiskType: 'relative' | 'absolute';
  selectedRiskColumns: string[];
  selectedPatients: Person[];
  showSelectedOnly: boolean;
  viewMode: 'patient' | 'population';
  providerList: ProviderList;
  selectedTimeframe: string;
}

export default function Index() {
  const navigate = useNavigate();
  const location = useLocation();
  const savedState = location.state as IndexPageState;

  const { data: patientData, isLoading, error } = usePatientDataLatest();
  const [searchQuery, setSearchQuery] = useState(savedState?.searchQuery || '');
  const [selectedRiskType, setSelectedRiskType] = useState<'relative' | 'absolute'>(savedState?.selectedRiskType || 'relative');
  const [selectedRiskColumns, setSelectedRiskColumns] = useState<string[]>(
    savedState?.selectedRiskColumns || ['ED', 'Hospitalization', 'Fall', 'Stroke', 'HS']
  );
  const [selectedPatients, setSelectedPatients] = useState<Person[]>(savedState?.selectedPatients || []);
  const [showSelectedOnly, setShowSelectedOnly] = useState(savedState?.showSelectedOnly || false);
  const [viewMode, setViewMode] = useState<'patient' | 'population'>(savedState?.viewMode || 'patient');
  const [providerList, setProviderList] = useState<ProviderList>(
    savedState?.providerList || {
      availableList: PROVIDERS,
      selectedList: [],
    }
  );

  // Fetch available time periods from the database
  const { data: fetchedTimePeriods, isLoading: isTimePeriodsLoading } = useQuery({
    queryKey: ['index-time-periods'],
    queryFn: async () => {
      // Fetch from both tables to ensure we have all possible time periods
      const [riskDistResponse, patientRiskResponse] = await Promise.all([
        supabase.from('phenom_risk_dist').select('time_period').order('time_period'),
        supabase.from('phenom_risk').select('time_period').order('time_period')
      ]);
      
      if (riskDistResponse.error) {
        console.error('Error fetching risk_dist time periods:', riskDistResponse.error);
      }
      
      if (patientRiskResponse.error) {
        console.error('Error fetching patient risk time periods:', patientRiskResponse.error);
      }
      
      // Combine time periods from both tables
      const allTimePeriods = [
        ...(riskDistResponse.data || []).map(item => item.time_period),
        ...(patientRiskResponse.data || []).map(item => item.time_period)
      ];
      
      // Get unique values and sort
      const uniqueTimePeriods = [...new Set(allTimePeriods)].filter(Boolean).sort();
      console.log('Unique time periods for Index page:', uniqueTimePeriods);
      
      return uniqueTimePeriods.length > 0 ? uniqueTimePeriods : [1, 2]; // Default if empty
    }
  });
  
  // Get time periods from fetched data or patient data as fallback
  const timePeriods = fetchedTimePeriods || 
    (patientData 
      ? [...new Set(patientData.filter(p => p.prediction_timeframe_yrs !== null).map(p => p.prediction_timeframe_yrs))]
      : [1, 2]); // Default if nothing is available

  // Make sure we have a valid initial timeframe selection
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>(savedState?.selectedTimeframe || '1');
  
  // Set the timeframe once data is loaded
  useEffect(() => {
    if (timePeriods && timePeriods.length > 0) {
      // Check if the current selection exists in the new options
      const exists = timePeriods.includes(parseInt(selectedTimeframe));
      if (!exists) {
        // If not, select the first available option
        setSelectedTimeframe(timePeriods[0]?.toString() || '1');
      }
    }
  }, [timePeriods]);

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
    
    // Provider filtering: if no providers selected, show all; if providers selected, show only those
    const providerMatches = providerList.selectedList.length === 0 || 
      (patient.provider && providerList.selectedList.includes(patient.provider));

    return searchMatches && timeframeMatches && riskTypeMatches && selectedFilter && providerMatches;
  });

  const handlePatientClick = (patientId: number) => {
    const state: IndexPageState = {
      searchQuery,
      selectedRiskType,
      selectedRiskColumns,
      selectedPatients,
      showSelectedOnly,
      viewMode,
      providerList,
      selectedTimeframe,
    };
    navigate(`/patient/${patientId}`, { state });
  };

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
        <div className="max-w-[2000px] mx-auto">
          <div className="flex flex-col space-y-6">
            <div className="glass-card p-4">
              {viewMode === 'patient' ? (
                <>
                  <div className="flex justify-end mb-6">
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
                        className="px-4 py-1 h-10 data-[state=on]:bg-primary data-[state=on]:text-white"
                      >
                        Patient
                      </ToggleGroupItem>
                      <ToggleGroupItem 
                        value="population"
                        className="px-4 py-1 h-10 data-[state=on]:bg-primary data-[state=on]:text-white"
                      >
                        Population
                      </ToggleGroupItem>
                    </ToggleGroup>
                  </div>
                  <TableControls
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    selectedTimeframe={selectedTimeframe}
                    onTimeframeChange={setSelectedTimeframe}
                    selectedRiskColumns={selectedRiskColumns}
                    onRiskColumnsChange={setSelectedRiskColumns}
                    timeframes={isTimePeriodsLoading ? [1, 2] : timePeriods as number[]}
                    selectedRiskType={selectedRiskType}
                    onRiskTypeChange={setSelectedRiskType}
                    providerList={providerList}
                    onProviderSelection={setProviderList}
                    showSelectedOnly={showSelectedOnly}
                    onShowSelectedOnlyChange={setShowSelectedOnly}
                  />
                  <div className='flex justify-end mb-4'>
                      <p className='text-sm text-gray-600'>
                          {/* TODO: this will need to be replaced with a date from an endpoint */}
                          Data current as of: <span className='font-bold'>2024-04-04</span>
                      </p>
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
                      onPatientClick={handlePatientClick}
                    />
                  )}
                </>
              ) : (
                <>
                  <div className="flex justify-end mb-6">
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
                        className="px-4 py-1 h-10 data-[state=on]:bg-primary data-[state=on]:text-white"
                      >
                        Patient
                      </ToggleGroupItem>
                      <ToggleGroupItem 
                        value="population"
                        className="px-4 py-1 h-10 data-[state=on]:bg-primary data-[state=on]:text-white"
                      >
                        Population
                      </ToggleGroupItem>
                    </ToggleGroup>
                  </div>
                  <PopulationRiskDistribution
                    selectedTimeframe={selectedTimeframe}
                    selectedRiskType={selectedRiskType}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
