import { create } from 'zustand';
import { Person } from '@/types/population';
import { SortingState } from '@tanstack/react-table';

// Default providers list
const DEFAULT_PROVIDERS = ['Provider A', 'Provider B', 'Provider C'];

export interface ProviderList {
  availableList: string[];
  selectedList: string[];
}

export interface PatientPanelState {
  // Filter state
  searchQuery: string;
  selectedRiskType: 'relative' | 'absolute';
  selectedRiskColumns: string[];
  selectedPatients: Person[];
  showSelectedOnly: boolean;
  providerList: ProviderList;
  selectedTimeframe: string;
  selectedModelType: string;
  sorting: SortingState;
  currentViewId: string | undefined;
  
  // Track if columns have been initialized
  hasInitializedColumns: boolean;
  
  // Actions
  setSearchQuery: (query: string) => void;
  setSelectedRiskType: (riskType: 'relative' | 'absolute') => void;
  setSelectedRiskColumns: (columns: string[]) => void;
  setSelectedPatients: (patients: Person[]) => void;
  setShowSelectedOnly: (show: boolean) => void;
  setProviderList: (providers: ProviderList) => void;
  setSelectedTimeframe: (timeframe: string) => void;
  setSelectedModelType: (modelType: string) => void;
  setSorting: (sorting: SortingState) => void;
  setCurrentViewId: (viewId: string | undefined) => void;
  setHasInitializedColumns: (initialized: boolean) => void;
  
  // Bulk update for loading saved views
  loadSavedView: (view: {
    model_type: string;
    risk_type: 'relative' | 'absolute';
    timeframe: string;
    outcomes: string[];
    sorting?: SortingState;
    id: string;
  }) => void;
  
  // Reset to defaults
  reset: () => void;
}

const initialState = {
  searchQuery: '',
  selectedRiskType: 'absolute' as const,
  selectedRiskColumns: [],
  selectedPatients: [],
  showSelectedOnly: false,
  providerList: {
    availableList: DEFAULT_PROVIDERS,
    selectedList: [],
  },
  selectedTimeframe: '1',
  selectedModelType: 'future_risk',
  sorting: [{ id: 'composite_risk', desc: true }] as SortingState,
  currentViewId: undefined,
  hasInitializedColumns: false,
};

export const usePatientPanelStore = create<PatientPanelState>((set) => ({
  ...initialState,
  
  // Individual setters
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedRiskType: (riskType) => set({ selectedRiskType: riskType }),
  setSelectedRiskColumns: (columns) => set({ selectedRiskColumns: columns }),
  setSelectedPatients: (patients) => set({ selectedPatients: patients }),
  setShowSelectedOnly: (show) => set({ showSelectedOnly: show }),
  setProviderList: (providers) => set({ providerList: providers }),
  setSelectedTimeframe: (timeframe) => set({ selectedTimeframe: timeframe }),
  setSelectedModelType: (modelType) => set({ selectedModelType: modelType }),
  setSorting: (sorting) => set({ sorting: sorting }),
  setCurrentViewId: (viewId) => set({ currentViewId: viewId }),
  setHasInitializedColumns: (initialized) => set({ hasInitializedColumns: initialized }),
  
  // Load a saved view - updates multiple fields at once
  loadSavedView: (view) => set({
    selectedModelType: view.model_type,
    selectedRiskType: view.risk_type,
    selectedTimeframe: view.timeframe,
    selectedRiskColumns: view.outcomes,
    sorting: view.sorting || [{ id: 'composite_risk', desc: true }],
    currentViewId: view.id,
  }),
  
  // Reset to initial state
  reset: () => set(initialState),
}));
