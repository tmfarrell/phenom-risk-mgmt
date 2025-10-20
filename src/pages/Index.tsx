import { ResultsTable } from '@/components/ResultsTable';
import { Header } from '@/components/Header';
import { usePatientDataLatest } from '@/hooks/usePatientDataLatest';
import { Skeleton } from '@/components/ui/skeleton';
import { useState, useEffect, useRef } from 'react';
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
  const [selectedRiskColumns, setSelectedRiskColumns] = useState<string[]>([]);
  const [selectedPatients, setSelectedPatients] = useState<Person[]>(savedState?.selectedPatients || []);
  const [showSelectedOnly, setShowSelectedOnly] = useState(savedState?.showSelectedOnly || false);
  const [viewMode, setViewMode] = useState<'patient' | 'population'>(savedState?.viewMode || 'patient');
  const [providerList, setProviderList] = useState<ProviderList>(
    savedState?.providerList || {
      availableList: PROVIDERS,
      selectedList: [],
    }
  );

  // Fetch available outcomes and time periods from phenom_models
  const { data: phenomModelsData, isLoading: isModelsLoading } = useQuery({
    queryKey: ['phenom-models-outcomes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('phenom_models')
        .select('id, indication_code, model_name, prediction_timeframe_yrs')
        .order('model_name');
      
      if (error) {
        console.error('Error fetching phenom_models:', error);
        throw error;
      }
      
      // Create a map of outcomes to their available timeframes and model info
      const outcomeTimeframeMap: Record<string, Array<number | 'today'>> = {};
      const outcomeModelMap: Record<string, Array<{id: string, timeframe: number | 'today'}>> = {};
      // Map indication_code to a display label (model_name)
      const outcomeLabelMap: Record<string, string> = {};
      
      data?.forEach(item => {
        if (!outcomeTimeframeMap[item.indication_code]) {
          outcomeTimeframeMap[item.indication_code] = [];
          outcomeModelMap[item.indication_code] = [];
        }
        // set display label from model_name (prefer first seen)
        if (!outcomeLabelMap[item.indication_code] && item.model_name) {
          outcomeLabelMap[item.indication_code] = item.model_name;
        }
        const tf = item.prediction_timeframe_yrs === null ? 'today' : item.prediction_timeframe_yrs;
        if (!outcomeTimeframeMap[item.indication_code].includes(tf)) {
          outcomeTimeframeMap[item.indication_code].push(tf);
        }
        outcomeModelMap[item.indication_code].push({
          id: item.id,
          timeframe: tf
        });
      });
      
      // Extract unique timeframes, including 'today' if any nulls exist
      const hasToday = (data || []).some(item => item.prediction_timeframe_yrs === null);
      const numericTimeframes = [...new Set((data || [])
        .map(item => item.prediction_timeframe_yrs)
        .filter((v): v is number => typeof v === 'number'))].sort((a, b) => a - b);
      const uniqueTimeframes: Array<number | 'today'> = hasToday ? ['today', ...numericTimeframes] : numericTimeframes;
      
      console.log('Outcome to timeframe mapping:', outcomeTimeframeMap);
      console.log('Available timeframes from phenom_models:', uniqueTimeframes);
      
      return {
        outcomeTimeframeMap,
        outcomeModelMap,
        outcomeLabelMap,
        timeframes: uniqueTimeframes,
        rawData: data
      };
    }
  });

  // Use timeframes from phenom_models
  const timePeriods = (phenomModelsData?.timeframes as Array<number | 'today'>) || [1, 2];

  // Helper function to convert timeframe string to decimal years for database comparison
  const parseTimeframeToYears = (timeframe: string): number => {
    if (timeframe === 'today') return 0;
    if (timeframe.includes('months')) {
      const months = parseInt(timeframe);
      return months / 12;
    }
    return parseFloat(timeframe); // For years (including decimal values like 0.25)
  };

  // Make sure we have a valid initial timeframe selection
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>(savedState?.selectedTimeframe || '1');
  
  // Set the timeframe and outcomes once data is loaded
  useEffect(() => {
    if (timePeriods && timePeriods.length > 0) {
      // Check if the current selection exists in the new options
      const exists = selectedTimeframe === 'today'
        ? (timePeriods as Array<number | 'today'>).includes('today')
        : (timePeriods as Array<number | 'today'>).includes(parseInt(selectedTimeframe));
      if (!exists) {
        // If not, select the first available option
        const first = timePeriods[0];
        setSelectedTimeframe(first === 'today' ? 'today' : (first as number).toString());
      }
    }
  }, [timePeriods]);

  // Get available outcomes with model info for the selected timeframe
  const availableOutcomesForTimeframe = phenomModelsData?.outcomeTimeframeMap 
    ? Object.entries(phenomModelsData.outcomeTimeframeMap)
        .filter(([_, timeframes]) => selectedTimeframe === 'today'
          ? (timeframes as Array<number | 'today'>).includes('today')
          : (timeframes as Array<number | 'today'>).includes(parseTimeframeToYears(selectedTimeframe)))
        .map(([outcome]) => outcome)
        .sort()
    : [];
    
  // Get model data for available outcomes
  const availableModelsForTimeframe = phenomModelsData?.outcomeModelMap
    ? Object.entries(phenomModelsData.outcomeModelMap)
        .reduce((acc, [outcome, models]) => {
          const modelsForTimeframe = models.filter(m =>
            selectedTimeframe === 'today'
              ? m.timeframe === 'today'
              : m.timeframe === parseTimeframeToYears(selectedTimeframe)
          );
          if (modelsForTimeframe.length > 0) {
            acc.push({
              outcome,
              modelId: modelsForTimeframe[0].id // Use the first model ID for this outcome/timeframe combination
            });
          }
          return acc;
        }, [] as Array<{outcome: string, modelId: string}>)
        .sort((a, b) => a.outcome.localeCompare(b.outcome))
    : [];

  // Track the previous timeframe to detect changes
  const prevTimeframeRef = useRef<string>(selectedTimeframe);
  const hasInitializedRef = useRef<boolean>(false);

  // Set initial risk columns when outcomes are loaded (only once)
  useEffect(() => {
    if (availableOutcomesForTimeframe.length > 0 && !hasInitializedRef.current) {
      // Select first 4 outcomes by default
      setSelectedRiskColumns(availableOutcomesForTimeframe.slice(0, 4));
      hasInitializedRef.current = true;
    }
  }, [availableOutcomesForTimeframe]);

  // Whenever timeframe changes, select the first 4 outcomes for that timeframe
  useEffect(() => {
    if (prevTimeframeRef.current !== selectedTimeframe) {
      if (availableOutcomesForTimeframe.length > 0) {
        setSelectedRiskColumns(availableOutcomesForTimeframe.slice(0, 4));
      } else {
        setSelectedRiskColumns([]);
      }
      prevTimeframeRef.current = selectedTimeframe;
    }
  }, [selectedTimeframe, availableOutcomesForTimeframe]);

  // Calculate average risks from the full dataset
  const averageRisks = patientData ? calculateAverageRisks(patientData) : {};

  const filteredData = patientData?.filter((patient: Person) => {
    const searchLower = searchQuery.toLowerCase();
    const nameMatch = patient.name?.toLowerCase().includes(searchLower);
    const mrnMatch = patient.mrn?.toString().includes(searchQuery);
    const searchMatches = nameMatch || mrnMatch;

    const timeframeMatches = selectedTimeframe === 'today'
      ? (patient.prediction_timeframe_yrs === null || patient.prediction_timeframe_yrs === undefined)
      : patient.prediction_timeframe_yrs === parseTimeframeToYears(selectedTimeframe);
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
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex items-start">
        <div className="px-6 pt-6">
          <h1 className="text-2xl font-bold text-blue-900 text-left">Patient Risk Panel</h1>
          {/* <p className="text-gray-600 text-left">Manage and analyze patient risks</p> */}
        </div>
      </div>
      <div className="p-6">
        <div className="max-w-[1250px] mx-auto">
          <div className="flex flex-col space-y-6">
            <div className="glass-card p-4 overflow-hidden">
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
                    timeframes={isModelsLoading ? [1, 2] : (timePeriods as Array<number | 'today'>)}
                    selectedRiskType={selectedRiskType}
                    onRiskTypeChange={setSelectedRiskType}
                    providerList={providerList}
                    onProviderSelection={setProviderList}
                    showSelectedOnly={showSelectedOnly}
                    onShowSelectedOnlyChange={setShowSelectedOnly}
                    availableOutcomes={availableOutcomesForTimeframe}
                    availableModels={availableModelsForTimeframe}
                    outcomeLabels={phenomModelsData?.outcomeLabelMap}
                  />
                  <div className='flex justify-end mb-4'>
                      <p className='text-sm text-gray-600'>
                          {/* TODO: this will need to be replaced with a date from an endpoint */}
                          Data current as of: <span className='font-bold'>2025-09-12</span>
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
                    outcomeLabels={phenomModelsData?.outcomeLabelMap}
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
