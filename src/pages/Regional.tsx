import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CohortSelector } from '@/components/CohortSelector';
import GeographicalTable from '@/components/GeographicalTable';
import GeographicalMap from '@/components/GeographicalMap';
import GeographicalFilters from '@/components/GeographicalFilters';
import { Header } from '@/components/Header';

export interface ProviderFilterValues {
  states: string[];
  specialties: string[];

  medications: string[];
  notPrescribedMedications: string[];
  minYearsInPractice: number;
  minPrescribingVolume: number;
  statusValues: string[];
  isClientTarget: 'all' | 'yes' | 'no';
  searchQuery: string;
}

export interface GeographicalFilterValues {
  groupingLevel: 'state' | 'city' | 'zipcode';
  states: string[];
}

const Regional = () => {
  const navigate = useNavigate();
  
  // Try to restore state from sessionStorage
  const getSavedState = () => {
    // Detect hard page refresh and reset state in that case
    const navEntry = (performance && 'getEntriesByType' in performance)
      ? (performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined)
      : undefined;

    const savedState = sessionStorage.getItem('providerFinderState');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        // Don't restore loading states or file objects
        return {
          ...parsed,
          isPhenomLoading: false,
          shouldResetPhenom: false,
          selectedNpiFile: null,
          loadDate: parsed.loadDate ? new Date(parsed.loadDate) : null
        };
      } catch (e) {
        console.error('Failed to parse saved state:', e);
      }
    }
    return null;
  };

  const savedState = getSavedState();
  
  const [isPhenomLoading, setIsPhenomLoading] = useState(false);
  const [showPhenomData, setShowPhenomData] = useState(savedState?.showPhenomData || false);
  const [shouldResetPhenom, setShouldResetPhenom] = useState(false);
  const [selectedModelData, setSelectedModelData] = useState<{ id: string; name: string; source?: 'phenom' | 'dataset'; patients?: number; providers?: number } | null>(savedState?.selectedModelData || null);
  const [selectedNpiFile, setSelectedNpiFile] = useState<File | null>(null);
  const [selectedNpiListName, setSelectedNpiListName] = useState<string | null>(savedState?.selectedNpiListName || null);
  const [loadDate, setLoadDate] = useState<Date | null>(savedState?.loadDate ? new Date(savedState.loadDate) : null);
  const [isFiltersCollapsed, setIsFiltersCollapsed] = useState<boolean>(savedState?.isFiltersCollapsed ?? true);
  const [showCounts, setShowCounts] = useState<boolean>(savedState?.showCounts ?? true);
  const [viewMode, setViewMode] = useState<'individual' | 'geographical'>(savedState?.viewMode || 'individual');
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);
  // Shared provider list sorting & pagination (controls table and map)
  const [providerSortField, setProviderSortField] = useState<'patients_phenom' | 'name' | 'npi' | 'location' | 'specialty'>('patients_phenom');
  const [providerSortDirection, setProviderSortDirection] = useState<'asc' | 'desc'>('desc');
  const [providerPage, setProviderPage] = useState<number>(1);
  const [providerPageSize, setProviderPageSize] = useState<number>(250);
  
  // Filter state
  const [filters, setFilters] = useState<ProviderFilterValues>(savedState?.filters || {
    states: [],
    specialties: [],

    medications: [],
    notPrescribedMedications: [],
    minYearsInPractice: 0,
    minPrescribingVolume: 0,
    statusValues: [],
    isClientTarget: 'all',
    searchQuery: ''
  });

  const [geoFilters, setGeoFilters] = useState<GeographicalFilterValues>(savedState?.geoFilters || {
    groupingLevel: 'state',
    states: []
  });

  // Save state to sessionStorage whenever it changes
  useEffect(() => {
    const stateToSave = {
      showPhenomData,
      selectedModelData,
      selectedNpiListName,
      loadDate: loadDate?.toISOString(),
      isFiltersCollapsed,
      showCounts,
      viewMode,
      filters,
      geoFilters,
      providerSortField,
      providerSortDirection,
      providerPage,
      providerPageSize
    };
    sessionStorage.setItem('providerFinderState', JSON.stringify(stateToSave));
  }, [showPhenomData, selectedModelData, selectedNpiListName, loadDate, isFiltersCollapsed, showCounts, viewMode, filters, geoFilters, providerSortField, providerSortDirection, providerPage, providerPageSize]);

  // If we have a cached model selection but data isn't marked as shown, mark it shown
  useEffect(() => {
    if (savedState && selectedModelData && !showPhenomData && !isPhenomLoading) {
      // Only auto-show if we're restoring from cache
      setShowPhenomData(true);
      setShouldResetPhenom(false);
      setLoadDate((prev) => prev || new Date());
    }
  }, []); // Run only on mount

  // Optional: Clear sessionStorage when user explicitly resets or logs out
  useEffect(() => {
    // Clear on page unload if user is logging out or closing tab
    const handleBeforeUnload = () => {
      // Only clear if the user is actually leaving the app, not just navigating
      if (!window.location.pathname.includes('/provider/')) {
        // Keep the state if navigating to provider details
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const handleFileUpload = (file: File | null) => {
    setSelectedNpiFile(file);
    setShowPhenomData(false);
  };

  const handleNpiListChange = (listName: string | null) => {
    // Only reset if list actually changed
    if (listName !== selectedNpiListName) {
      setSelectedNpiListName(listName);
      setShowPhenomData(false);
    }
  };

  const handleLoad = (loading: boolean) => {
    setIsPhenomLoading(loading);
    if (!loading) {
      setShowPhenomData(true);
      setShouldResetPhenom(false);
      setLoadDate(new Date());
    }
  };

  const handleModelChange = (modelData: { id: string; name: string; source?: 'phenom' | 'dataset'; patients?: number } | null) => {
    // Only reset if model actually changed
    if (modelData?.id !== selectedModelData?.id) {
      setSelectedModelData(modelData);
      setShowPhenomData(false);
      setShouldResetPhenom(true);
      setLoadDate(null);
      // Reset provider list controls on model change
      setProviderPage(1);
      setProviderSortField('patients_phenom');
      setProviderSortDirection('desc');
    }
  };

  const handleFiltersCollapseChange = (collapsed: boolean) => {
    setIsFiltersCollapsed(collapsed);
  };

  return (
    <div className="space-y-6">
      <Header />
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-blue-900 ml-6">Regional Risk Panel</h1>
          {/*<p className="text-gray-600">Discover healthcare providers using real-world data and AI</p>*/}
        </div>
      </div>

      {/* Load Controls */}
      <div className="space-y-4 mx-4">
        <CohortSelector 
          onModelChange={handleModelChange} 
          onFileUpload={handleFileUpload}
          onNpiListChange={handleNpiListChange}
          onLoad={handleLoad}
          shouldReset={shouldResetPhenom}
          showNpiUpload={true}
          initialModel={selectedModelData}
          initialNpiListName={selectedNpiListName}
          filterProviderAnalytics={true}
        />
      </div>
      

      <>
          {/* Main Content Row: List, Map, and Filters side by side */}
          <div className="flex gap-6 h-full mx-4">
            {/* Geographical Groupings List */}
            <div className="w-1/3 min-w-[320px]">
              <GeographicalTable 
                isLoading={isPhenomLoading}
                showData={showPhenomData}
                hasNpiFile={!!selectedNpiFile}
                filters={geoFilters}
                selectedModelData={selectedModelData}
                selectedNpiListName={selectedNpiListName}
                selectedRegionId={selectedRegionId}
                onRegionClick={setSelectedRegionId}
              />
            </div>
            
            {/* Geographical Map */}
            <div className="flex-1 min-w-[400px]">
              <GeographicalMap 
                isLoading={isPhenomLoading}
                showData={showPhenomData}
                hasNpiFile={!!selectedNpiFile}
                filters={geoFilters}
                selectedModelData={selectedModelData}
                selectedNpiListName={selectedNpiListName}
                selectedRegionId={selectedRegionId}
                onRegionClick={setSelectedRegionId}
              />
            </div>
            
            {/* Geographical Filters */}
            <div className="flex-shrink-0">
              <GeographicalFilters 
                onCollapseChange={handleFiltersCollapseChange} 
                hasNpiFile={!!selectedNpiFile}
                filters={geoFilters}
                onFiltersChange={setGeoFilters}
              />
            </div>
          </div>
        </>
    </div>
  );
};

export default Regional;