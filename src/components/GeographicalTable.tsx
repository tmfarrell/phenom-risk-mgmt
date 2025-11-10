import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { Users, Hospital, Info } from 'lucide-react';
import { GeographicalFilterValues } from '@/pages/Regional';
import { useProvidersData } from '@/hooks/useProvidersData';

interface GeographicalData {
  id: string;
  name: string;
  type: 'state' | 'city' | 'zipcode';
  providerCount: number;
  avgYearsInPractice: number;
  newTargetCount: number;
  totalPatients: number;
  highRiskPatients: number;
  phenomLiftScore: number; // as percentage
  phenomLiftPotential: 'Low Risk' | 'Medium Risk' | 'High Risk';
}

interface GeographicalTableProps {
  isLoading: boolean;
  showData: boolean;
  hasNpiFile: boolean;
  filters: GeographicalFilterValues;
  selectedModelData: { id: string; name: string } | null;
  selectedNpiListName?: string | null;
  selectedRegionId?: string | null;
  onRegionClick?: (regionId: string) => void;
}

const GeographicalTable: React.FC<GeographicalTableProps> = ({
  isLoading,
  showData,
  hasNpiFile,
  filters,
  selectedModelData,
  selectedNpiListName,
  selectedRegionId,
  onRegionClick
}) => {
  const [geographicalData, setGeographicalData] = useState<GeographicalData[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  // Fetch via shared hook and aggregate
  const { data: sharedData, isFetching } = useProvidersData({
    modelId: selectedModelData?.id || null,
    npiListName: selectedNpiListName || null,
    page: 1,
    pageSize: 5000,
    filters: {
      states: filters.states || [],
      specialties: [],
      medications: [],
      notPrescribedMedications: [],
      minYearsInPractice: 0,
      minPrescribingVolume: 0,
      statusValues: [],
      isClientTarget: 'all',
      searchQuery: ''
    }
  });

  useEffect(() => {
    if (!showData || isLoading || !selectedModelData) {
      setGeographicalData([]);
      setDataLoading(false);
      return;
    }
    setDataLoading(isFetching);

    const providers = ((sharedData as any)?.providers || []) as Array<{
      state: string;
      region: string;
      city: string;
      zip_code: string;
      years_in_practice: number;
      phenom_lift_potential: number;
      patients: number;
      patients_phenom?: number;
      is_client_target: boolean;
    }>;

    const aggregated: GeographicalData[] = [];

    if (filters.groupingLevel === 'state') {
      const groups = providers.reduce((acc, p) => {
        const key = p.state || 'Unknown';
        if (!acc[key]) acc[key] = [];
        acc[key].push(p);
        return acc;
      }, {} as Record<string, typeof providers>);

      Object.entries(groups).forEach(([stateName, items]) => {
        const totalPatients = items.reduce((s, x) => s + (x.patients || 0), 0);
        const highRiskPatients = items.reduce((s, x) => s + (x.patients_phenom || 0), 0);
        const avgPhenom = Math.round(items.reduce((s, x) => s + (x.phenom_lift_potential || 0), 0) / items.length);
        const avgYears = Math.round(items.reduce((s, x) => s + (x.years_in_practice || 0), 0) / items.length);
        const newTargets = (selectedNpiListName ? items.filter(x => !x.is_client_target).length : 0);
        aggregated.push({
          id: stateName,
          name: stateName,
          type: 'state',
          providerCount: items.length,
          avgYearsInPractice: avgYears,
          newTargetCount: newTargets,
          totalPatients,
          highRiskPatients,
          phenomLiftScore: avgPhenom,
          phenomLiftPotential: 'Low Risk' // Will be calculated after all data is aggregated
        });
      });
    } else if (filters.groupingLevel === 'city') {
      const groups = providers.reduce((acc, p) => {
        const key = p.city && p.state ? `${p.city}, ${p.state}` : '';
        if (!key) return acc;
        if (!acc[key]) acc[key] = [];
        acc[key].push(p);
        return acc;
      }, {} as Record<string, typeof providers>);

      Object.entries(groups)
        .filter(([, items]) => items.length >= 2)
        .forEach(([cityName, items]) => {
          const totalPatients = items.reduce((s, x) => s + (x.patients || 0), 0);
          const highRiskPatients = items.reduce((s, x) => s + (x.patients_phenom || 0), 0);
          const avgPhenom = Math.round(items.reduce((s, x) => s + (x.phenom_lift_potential || 0), 0) / items.length);
          const avgYears = Math.round(items.reduce((s, x) => s + (x.years_in_practice || 0), 0) / items.length);
          const newTargets = (selectedNpiListName ? items.filter(x => !x.is_client_target).length : 0);
          aggregated.push({
            id: cityName,
            name: cityName,
            type: 'city',
            providerCount: items.length,
            avgYearsInPractice: avgYears,
            newTargetCount: newTargets,
            totalPatients,
            highRiskPatients,
            phenomLiftScore: avgPhenom,
            phenomLiftPotential: 'Low Risk' // Will be calculated after all data is aggregated
          });
        });
    } else if (filters.groupingLevel === 'zipcode') {
      const groups = providers.reduce((acc, p) => {
        const key = p.zip_code ? String(p.zip_code) : '';
        if (!key) return acc;
        if (!acc[key]) acc[key] = [];
        acc[key].push(p);
        return acc;
      }, {} as Record<string, typeof providers>);

      Object.entries(groups)
        .filter(([, items]) => items.length >= 3)
        .forEach(([zip, items]) => {
          const totalPatients = items.reduce((s, x) => s + (x.patients || 0), 0);
          const highRiskPatients = items.reduce((s, x) => s + (x.patients_phenom || 0), 0);
          const avgPhenom = Math.round(items.reduce((s, x) => s + (x.phenom_lift_potential || 0), 0) / items.length);
          const avgYears = Math.round(items.reduce((s, x) => s + (x.years_in_practice || 0), 0) / items.length);
          const newTargets = (selectedNpiListName ? items.filter(x => !x.is_client_target).length : 0);
          const locationName = `${zip}`;
          aggregated.push({
            id: zip,
            name: locationName,
            type: 'zipcode',
            providerCount: items.length,
            avgYearsInPractice: avgYears,
            newTargetCount: newTargets,
            totalPatients,
            highRiskPatients,
            phenomLiftScore: avgPhenom,
            phenomLiftPotential: 'Low Risk' // Will be calculated after all data is aggregated
          });
        });
    }

    // Calculate risk levels based on percentiles of high-risk patient counts
    if (aggregated.length > 0) {
      // Sort by high-risk patient count to calculate percentiles
      const sortedByHighRisk = [...aggregated].sort((a, b) => a.highRiskPatients - b.highRiskPatients);
      
      // Calculate percentile thresholds
      const calculatePercentile = (percentile: number) => {
        const index = Math.ceil((percentile / 100) * sortedByHighRisk.length) - 1;
        return sortedByHighRisk[Math.max(0, index)].highRiskPatients;
      };
      
      const p85 = calculatePercentile(85);
      const p60 = calculatePercentile(60);
      
      // Assign risk levels based on percentiles
      aggregated.forEach(area => {
        if (area.highRiskPatients >= p85) {
          area.phenomLiftPotential = 'High Risk';
        } else if (area.highRiskPatients >= p60) {
          area.phenomLiftPotential = 'Medium Risk';
        } else {
          area.phenomLiftPotential = 'Low Risk';
        }
      });
    }

    aggregated.sort((a, b) => b.highRiskPatients - a.highRiskPatients);
    setGeographicalData(aggregated);
  }, [showData, isLoading, filters, selectedModelData, sharedData, isFetching, selectedNpiListName]);
  if (isLoading || dataLoading) {
    return (
      <Card className="h-full">
        <CardContent className="p-6 text-center">
          <div className="flex items-center justify-center gap-2 text-blue-600">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            Loading regional data...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!showData) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Select a model to load Regional List</p>
        </CardContent>
      </Card>
    );
  }

  if (geographicalData.length === 0) {
    return (
      <Card className="h-full shadow-lg border-0 bg-white rounded-xl overflow-hidden">
        <CardContent className="flex items-center justify-center py-6">
          <p className="text-red-500">Data load still in progress</p>
        </CardContent>
      </Card>
    );
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'state': return 'State';
      case 'city': return 'City';
      case 'region': return 'Region';
      case 'zipcode': return 'Zip Code';
      default: return type;
    }
  };

  const getPotentialBadgeClass = (potential: string) => {
    const variants: Record<string, string> = {
      'High Risk': 'bg-red-600 text-white border-red-700 hover:bg-red-700 hover:text-white',
      'Medium Risk': 'bg-orange-500 text-white border-orange-600 hover:bg-orange-600 hover:text-white',
      'Low Risk': 'bg-yellow-400 text-gray-900 border-yellow-500 hover:bg-yellow-500 hover:text-gray-900'
    };
    return variants[potential] || variants['Low Risk'];
  };

  return (
    <TooltipProvider>
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            Regional List
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 max-h-[600px] overflow-y-auto">
        {geographicalData.map((area) => (
          <Card 
            key={area.id} 
            className={`p-4 hover:shadow-md transition-all cursor-pointer ${
              selectedRegionId === area.id ? 'ring-2 ring-blue-500 shadow-lg bg-blue-50' : ''
            }`}
            onClick={() => onRegionClick?.(area.id)}
          >
            <div className="space-y-3">
              {/* Header */}
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-900">{area.name}</h3>
                  <Badge variant="outline" className="mt-1 text-xs">
                    {getTypeLabel(area.type)}
                  </Badge>
                </div>
                <div className="flex flex-col gap-2">
                  <Badge variant="outline" className={`text-xs ${getPotentialBadgeClass(area.phenomLiftPotential)}`}>
                    {area.phenomLiftPotential}
                  </Badge>
                  {hasNpiFile && area.newTargetCount > 0 && (
                    <Badge variant="outline" className="bg-blue-50 text-blue-500 border-blue-200 text-xs">
                      {area.newTargetCount} New Targets
                    </Badge>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">{area.providerCount}</span>
                  <span className="text-gray-600">providers</span>
                </div>
                <div className="flex items-center gap-2">
                  <Hospital className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">{area.totalPatients.toLocaleString()}</span>
                  <span className="text-gray-600">patients</span>
                </div>
              </div>

              {/* High Risk PhenOM Patients */}
              <div className="pt-2 border-t border-gray-100 text-center">
                <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
                  <span>High Risk PhenOM Patients</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3 w-3 text-gray-500" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>High risk patients identified for this geographical area</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="font-bold text-lg text-green-600">{area.highRiskPatients.toLocaleString()}</div>
              </div>
            </div>
          </Card>
        ))}
      </CardContent>
    </Card>
    </TooltipProvider>
  );
};

export default GeographicalTable;