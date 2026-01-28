import { ResultsTable } from '@/components/ResultsTable';
import { Header } from '@/components/Header';
import { usePatientDataLatest } from '@/hooks/usePatientDataLatest';
import { Skeleton } from '@/components/ui/skeleton';
import { useState, useEffect, useRef } from 'react';
import { Person } from '@/types/population';
import { TableControls } from '@/components/table/TableControls';
import { calculateAverageRisks } from '@/components/table/utils/riskCalculations';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Check, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useSavedViews, SavedView } from '@/hooks/useSavedViews';
import { SaveViewModal } from '@/components/SaveViewModal';
import { SavedViewsDropdown } from '@/components/SavedViewsDropdown';
import { usePatientPanelStore } from '@/stores/patientPanelStore';

// Model type options with colors matching PhenomBuilder badges
const MODEL_TYPES = [
  { 
    value: 'future_risk', 
    label: 'Future Risk',
    textColor: 'text-red-700'
  },
  { 
    value: 'screening', 
    label: 'Screening',
    textColor: 'text-blue-700'
  },
  { 
    value: 'care_opportunity', 
    label: 'Care Opportunity',
    textColor: 'text-green-700'
  },
];

export default function Index() {
  const navigate = useNavigate();

  const { data: patientData, isLoading, error } = usePatientDataLatest();
  
  // Zustand store for persistent state
  const {
    searchQuery,
    selectedRiskType,
    selectedRiskColumns,
    selectedPatients,
    showSelectedOnly,
    providerList,
    selectedTimeframe,
    selectedModelType,
    sorting,
    currentViewId,
    hasInitializedColumns,
    setSearchQuery,
    setSelectedRiskType,
    setSelectedRiskColumns,
    setSelectedPatients,
    setShowSelectedOnly,
    setProviderList,
    setSelectedTimeframe,
    setSelectedModelType,
    setSorting,
    setCurrentViewId,
    setHasInitializedColumns,
    loadSavedView,
  } = usePatientPanelStore();
  
  // Local UI state (not persisted)
  const [saveViewModalOpen, setSaveViewModalOpen] = useState(false);
  const [modelTypeOpen, setModelTypeOpen] = useState(false);
  
  // Saved views hooks
  const {
    savedViews,
    isLoading: isLoadingViews,
    createViewAsync,
    deleteView,
    isCreating,
    isDeleting,
  } = useSavedViews();

  // Fetch available outcomes and time periods from phenom_models
  const { data: phenomModelsData, isLoading: isModelsLoading } = useQuery({
    queryKey: ['phenom-models-outcomes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('phenom_models')
        .select('id, indication_code, model_name, prediction_timeframe_yrs, indication_type')
        .order('model_name');
      
      if (error) {
        console.error('Error fetching phenom_models:', error);
        throw error;
      }
      
      // Helper function to determine model type
      const getModelType = (item: any): string => {
        if (item.indication_type === 'medication') {
          return 'care_opportunity';
        }
        if (item.prediction_timeframe_yrs !== null && item.prediction_timeframe_yrs !== undefined) {
          return 'future_risk';
        }
        return 'screening';
      };
      
      // Create a map of outcomes to their available timeframes and model info
      const outcomeTimeframeMap: Record<string, Array<number | 'today'>> = {};
      const outcomeModelMap: Record<string, Array<{id: string, timeframe: number | 'today'}>> = {};
      // Map indication_code to a display label (model_name)
      const outcomeLabelMap: Record<string, string> = {};
      // Map indication_code to model type
      const outcomeModelTypeMap: Record<string, string> = {};
      
      data?.forEach(item => {
        if (!outcomeTimeframeMap[item.indication_code]) {
          outcomeTimeframeMap[item.indication_code] = [];
          outcomeModelMap[item.indication_code] = [];
        }
        // set display label from model_name (prefer first seen)
        if (!outcomeLabelMap[item.indication_code] && item.model_name) {
          outcomeLabelMap[item.indication_code] = item.model_name;
        }
        // set model type for this outcome
        if (!outcomeModelTypeMap[item.indication_code]) {
          outcomeModelTypeMap[item.indication_code] = getModelType(item);
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
      
      // Extract unique numeric timeframes only (exclude 'today' as it's now handled by model type)
      const numericTimeframes = [...new Set((data || [])
        .map(item => item.prediction_timeframe_yrs)
        .filter((v): v is number => typeof v === 'number'))].sort((a, b) => a - b);
      const uniqueTimeframes: Array<number> = numericTimeframes;
      
      console.log('Outcome to timeframe mapping:', outcomeTimeframeMap);
      console.log('Outcome to model type mapping:', outcomeModelTypeMap);
      console.log('Available timeframes from phenom_models:', uniqueTimeframes);
      
      return {
        outcomeTimeframeMap,
        outcomeModelMap,
        outcomeLabelMap,
        outcomeModelTypeMap,
        timeframes: uniqueTimeframes,
        rawData: data
      };
    }
  });

  // Use timeframes from phenom_models (only numeric values, 'today' is now handled by model type)
  const timePeriods = (phenomModelsData?.timeframes as Array<number>) || [1, 2];

  // Helper function to convert timeframe string to decimal years for database comparison
  const parseTimeframeToYears = (timeframe: string): number => {
    if (timeframe === 'today') return 0;
    if (timeframe.includes('months')) {
      const months = parseInt(timeframe);
      return months / 12;
    }
    return parseFloat(timeframe); // For years (including decimal values like 0.25)
  };

  // Set the timeframe and outcomes once data is loaded
  useEffect(() => {
    if (timePeriods && timePeriods.length > 0) {
      // Check if the current selection exists in the new options
      const currentValue = parseFloat(selectedTimeframe);
      const exists = !isNaN(currentValue) && timePeriods.includes(currentValue);
      if (!exists) {
        // If not, select the first available option
        setSelectedTimeframe(timePeriods[0].toString());
      }
    }
  }, [timePeriods]);

  // Get available outcomes with model info for the selected timeframe and model type
  const availableOutcomesForTimeframe = phenomModelsData?.outcomeTimeframeMap 
    ? Object.entries(phenomModelsData.outcomeTimeframeMap)
        .filter(([outcome, timeframes]) => {
          // Filter by model type
          const modelType = phenomModelsData.outcomeModelTypeMap?.[outcome];
          const modelTypeMatch = modelType === selectedModelType;
          
          // For Future Risk models, also filter by timeframe
          if (selectedModelType === 'future_risk') {
            const timeframeMatch = (timeframes as Array<number | 'today'>).includes(parseTimeframeToYears(selectedTimeframe));
            return modelTypeMatch && timeframeMatch;
          }
          
          // For Screening and Care Opportunity, show all outcomes of that type
          return modelTypeMatch;
        })
        .map(([outcome]) => outcome)
        .sort()
    : [];
    
  // Get model data for available outcomes
  const availableModelsForTimeframe = phenomModelsData?.outcomeModelMap
    ? Object.entries(phenomModelsData.outcomeModelMap)
        .reduce((acc, [outcome, models]) => {
          // Filter by model type
          const modelType = phenomModelsData.outcomeModelTypeMap?.[outcome];
          if (modelType !== selectedModelType) {
            return acc;
          }
          
          // For Future Risk models, filter by timeframe
          let relevantModels = models;
          if (selectedModelType === 'future_risk') {
            relevantModels = models.filter(m => m.timeframe === parseTimeframeToYears(selectedTimeframe));
          }
          
          if (relevantModels.length > 0) {
            acc.push({
              outcome,
              modelId: relevantModels[0].id // Use the first model ID for this outcome/timeframe combination
            });
          }
          return acc;
        }, [] as Array<{outcome: string, modelId: string}>)
        .sort((a, b) => a.outcome.localeCompare(b.outcome))
    : [];

  // Track the previous timeframe and model type to detect changes
  const prevTimeframeRef = useRef<string>(selectedTimeframe);
  const prevModelTypeRef = useRef<string>(selectedModelType);
  const isLoadingViewRef = useRef<boolean>(false);

  // Set initial risk columns when outcomes are loaded (only once)
  useEffect(() => {
    if (availableOutcomesForTimeframe.length > 0 && !hasInitializedColumns) {
      // Select first 4 outcomes by default
      setSelectedRiskColumns(availableOutcomesForTimeframe.slice(0, 4));
      setHasInitializedColumns(true);
    }
  }, [availableOutcomesForTimeframe, hasInitializedColumns, setSelectedRiskColumns, setHasInitializedColumns]);

  // Whenever timeframe or model type changes, select the first 4 outcomes for that combination
  useEffect(() => {
    if (prevTimeframeRef.current !== selectedTimeframe || prevModelTypeRef.current !== selectedModelType) {
      // Only auto-reset if we're not loading a saved view
      if (!isLoadingViewRef.current) {
        if (availableOutcomesForTimeframe.length > 0) {
          setSelectedRiskColumns(availableOutcomesForTimeframe.slice(0, 4));
        } else {
          setSelectedRiskColumns([]);
        }
      }
      prevTimeframeRef.current = selectedTimeframe;
      prevModelTypeRef.current = selectedModelType;
    }
    // Reset the flag after the effect runs
    isLoadingViewRef.current = false;
  }, [selectedTimeframe, selectedModelType, availableOutcomesForTimeframe, setSelectedRiskColumns]);

  // Calculate average risks from the full dataset
  const averageRisks = patientData ? calculateAverageRisks(patientData) : {};

  const filteredData = patientData?.filter((patient: Person) => {
    const searchLower = searchQuery.toLowerCase();
    const nameMatch = patient.name?.toLowerCase().includes(searchLower);
    const mrnMatch = patient.mrn?.toString().includes(searchQuery);
    const searchMatches = nameMatch || mrnMatch;

    // Timeframe filtering depends on model type
    let timeframeMatches = true;
    if (selectedModelType === 'future_risk') {
      // For Future Risk models, filter by selected timeframe
      timeframeMatches = patient.prediction_timeframe_yrs === parseTimeframeToYears(selectedTimeframe);
    } else {
      // For Screening and Care Opportunity models, show only patients with null/undefined timeframe (today)
      timeframeMatches = patient.prediction_timeframe_yrs === null || patient.prediction_timeframe_yrs === undefined;
    }
    
    const riskTypeMatches = patient.risk_type === selectedRiskType;
    const selectedFilter = showSelectedOnly ? selectedPatients.some(p => p.patient_id === patient.patient_id) : true;
    
    // Provider filtering: if no providers selected, show all; if providers selected, show only those
    const providerMatches = providerList.selectedList.length === 0 || 
      (patient.provider && providerList.selectedList.includes(patient.provider));

    return searchMatches && timeframeMatches && riskTypeMatches && selectedFilter && providerMatches;
  });

  // Handler to save the current view
  const handleSaveView = async (name: string) => {
    try {
      const newView = await createViewAsync({
        name,
        model_type: selectedModelType,
        risk_type: selectedRiskType,
        timeframe: selectedTimeframe,
        outcomes: selectedRiskColumns,
        sorting: sorting,
      });
      setCurrentViewId(newView.id);
      setSaveViewModalOpen(false);
    } catch (error) {
      // Error is already handled by the mutation's onError callback
      console.error('Failed to save view:', error);
    }
  };

  // Handler to load a saved view
  const handleSelectView = (view: SavedView) => {
    // Set flag to prevent auto-reset during view loading
    isLoadingViewRef.current = true;
    loadSavedView(view);
  };

  // Handler to delete a saved view
  const handleDeleteView = (id: string) => {
    deleteView(id);
    if (currentViewId === id) {
      setCurrentViewId(undefined);
    }
  };

  // Clear the current view selection if filters deviate from the saved view
  useEffect(() => {
    if (!currentViewId) return;
    
    const currentView = savedViews.find(v => v.id === currentViewId);
    if (!currentView) return;

    // Compare sorting states
    const sortingDeviated = JSON.stringify(currentView.sorting || []) !== JSON.stringify(sorting);

    // Check if any filter has deviated from the saved view
    const hasDeviated = 
      currentView.model_type !== selectedModelType ||
      currentView.risk_type !== selectedRiskType ||
      currentView.timeframe !== selectedTimeframe ||
      currentView.outcomes.length !== selectedRiskColumns.length ||
      !currentView.outcomes.every(outcome => selectedRiskColumns.includes(outcome)) ||
      sortingDeviated;

    if (hasDeviated) {
      setCurrentViewId(undefined);
    }
  }, [selectedModelType, selectedRiskType, selectedTimeframe, selectedRiskColumns, sorting, currentViewId, savedViews]);

  const handlePatientClick = (patientId: number) => {
    // State is persisted in Zustand store, no need to pass via location.state
    navigate(`/patient/${patientId}`);
  };

  if (error) {
    console.error('Error loading patient data:', error);
    return (
      <div className="min-h-screen w-full">
        <Header />
        <div>
          <div className="glass-card p-6">
            <p className="text-red-500">Error loading patient data. Please try again later.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full">
      <Header />
      <div className="flex items-start justify-between px-6 pt-6">
        <div>
          <h1 className="text-2xl font-bold text-blue-900 text-left">Patient Risk Panel</h1>
          {/* <p className="text-gray-600 text-left">Manage and analyze patient risks</p> */}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Model Type</label>
            <Popover open={modelTypeOpen} onOpenChange={setModelTypeOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={modelTypeOpen}
                  className="w-48 justify-between"
                >
                  <span className={cn(MODEL_TYPES.find(mt => mt.value === selectedModelType)?.textColor)}>
                    {MODEL_TYPES.find(mt => mt.value === selectedModelType)?.label || 'Future Risk'}
                  </span>
                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-0">
                <Command>
                  <CommandList>
                    <CommandGroup>
                      {MODEL_TYPES.map((modelType) => (
                        <CommandItem
                          key={modelType.value}
                          value={modelType.value}
                          onSelect={() => {
                            setSelectedModelType(modelType.value);
                            setModelTypeOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedModelType === modelType.value ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <span className={cn(modelType.textColor, "font-medium")}>
                            {modelType.label}
                          </span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Panel Views</label>
            <SavedViewsDropdown
              savedViews={savedViews}
              isLoading={isLoadingViews}
              onSaveClick={() => setSaveViewModalOpen(true)}
              onSelectView={handleSelectView}
              onDeleteView={handleDeleteView}
              isDeleting={isDeleting}
              currentViewId={currentViewId}
            />
          </div>
        </div>
      </div>
      <div className="p-6">
        <div className="flex flex-col space-y-6">
          <div className="glass-card p-4 overflow-hidden">
              <TableControls
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                selectedTimeframe={selectedTimeframe}
                onTimeframeChange={setSelectedTimeframe}
                selectedRiskColumns={selectedRiskColumns}
                onRiskColumnsChange={setSelectedRiskColumns}
                timeframes={isModelsLoading ? [1, 2] : (timePeriods as Array<number>)}
                selectedRiskType={selectedRiskType}
                onRiskTypeChange={setSelectedRiskType}
                providerList={providerList}
                onProviderSelection={setProviderList}
                showSelectedOnly={showSelectedOnly}
                onShowSelectedOnlyChange={setShowSelectedOnly}
                availableOutcomes={availableOutcomesForTimeframe}
                availableModels={availableModelsForTimeframe}
                outcomeLabels={phenomModelsData?.outcomeLabelMap}
                hideTimePeriod={selectedModelType !== 'future_risk'}
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
                  initialSorting={sorting}
                  onSortingChange={setSorting}
                />
              )}
            </div>
          </div>
      </div>

      <SaveViewModal
        open={saveViewModalOpen}
        onOpenChange={setSaveViewModalOpen}
        onSave={handleSaveView}
        isSaving={isCreating}
        currentView={{
          modelType: selectedModelType,
          riskType: selectedRiskType,
          timeframe: selectedTimeframe,
          outcomes: selectedRiskColumns,
          sorting: sorting,
        }}
        outcomeLabels={phenomModelsData?.outcomeLabelMap}
      />
    </div>
  );
}
