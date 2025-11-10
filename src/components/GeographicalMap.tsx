import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';
import L from 'leaflet';
import { GeographicalFilterValues } from '@/pages/Regional';
import { useProvidersData } from '@/hooks/useProvidersData';

// Fix for default markers
import 'leaflet/dist/leaflet.css';

// Create custom icon that matches individual provider map style
const createCustomIcon = (potential: string) => {
  const colors = {
    'High Potential': '#3b82f6', // blue-500
    'Medium Potential': '#dbeafe', // blue-100
    'Low Potential': '#6b7280' // gray-500
  };
  
  const color = colors[potential as keyof typeof colors] || colors['Low Potential'];
  
  return L.divIcon({
    html: `<div style="
      background-color: ${color};
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    "></div>`,
    className: 'custom-marker',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

interface GeographicalMapData {
  id: string;
  name: string;
  type: 'state' | 'city' | 'region' | 'zipcode';
  latitude: number;
  longitude: number;
  providerCount: number;
  newTargetCount: number;
  totalPatients: number;
  highRiskPatients: number;
  topSpecialties: string[];
  phenomLiftScore: number;
  phenomLiftPotential: 'Low Potential' | 'Medium Potential' | 'High Potential';
}

interface GeographicalMapProps {
  isLoading: boolean;
  showData: boolean;
  hasNpiFile: boolean;
  filters: GeographicalFilterValues;
  selectedModelData: { id: string; name: string } | null;
  selectedNpiListName?: string | null;
}

// State/Region center coordinates for mapping
const geographicalCenters: Record<string, { lat: number; lng: number }> = {
  // States
  'AK': { lat: 63.5887, lng: -154.4933 },
  'CA': { lat: 36.7783, lng: -119.4179 },
  'TX': { lat: 31.9686, lng: -99.9018 },
  'FL': { lat: 27.7663, lng: -81.6868 },
  'NY': { lat: 40.7128, lng: -74.0060 },
  'PA': { lat: 41.2033, lng: -77.1945 },
  'IL': { lat: 40.6331, lng: -89.3985 },
  'GA': { lat: 33.7490, lng: -84.3880 },
  'MA': { lat: 42.3601, lng: -71.0589 },
  'MI': { lat: 44.3148, lng: -85.6024 },
  'LA': { lat: 31.2448, lng: -92.4426 },
  'MN': { lat: 46.7296, lng: -94.6859 },
  'CO': { lat: 39.5501, lng: -105.7821 },
  'WA': { lat: 47.7511, lng: -120.7401 },
  'AZ': { lat: 34.0489, lng: -111.0937 },
  'AL': { lat: 32.8067, lng: -86.7911 },
  'AR': { lat: 35.2015, lng: -91.8318 },
  'CT': { lat: 41.5978, lng: -72.7559 },
  'DE': { lat: 39.7684, lng: -75.5509 },
  'HI': { lat: 21.3069, lng: -157.8583 },
  'ID': { lat: 44.2405, lng: -114.4788 },
  'IN': { lat: 39.7684, lng: -86.1581 },
  'KS': { lat: 38.5266, lng: -96.7265 },
  'KY': { lat: 37.6681, lng: -84.6701 },
  'MD': { lat: 39.0458, lng: -76.6413 },
  'ME': { lat: 44.6939, lng: -69.7844 },
  'MO': { lat: 38.5762, lng: -92.6020 },
  'MS': { lat: 32.7416, lng: -89.6763 },
  'MT': { lat: 46.9219, lng: -110.4543 },
  'NC': { lat: 35.6301, lng: -80.8491 },
  'ND': { lat: 47.5515, lng: -99.4032 },
  'NE': { lat: 41.1254, lng: -98.2681 },
  'NH': { lat: 43.4525, lng: -71.5639 },
  'NJ': { lat: 40.0583, lng: -74.4057 },
  'NM': { lat: 35.6868, lng: -105.9378 },
  'NV': { lat: 39.8760, lng: -119.9936 },
  'OH': { lat: 40.3675, lng: -82.9966 },
  'OK': { lat: 35.5653, lng: -97.4455 },
  'OR': { lat: 43.8041, lng: -120.5542 },
  'RI': { lat: 41.5801, lng: -71.4774 },
  'SC': { lat: 33.8361, lng: -81.1660 },
  'SD': { lat: 44.3393, lng: -100.2355 },
  'TN': { lat: 35.7479, lng: -86.7483 },
  'UT': { lat: 39.4192, lng: -111.9507 },
  'VA': { lat: 37.7749, lng: -78.1662 },
  'VT': { lat: 44.0459, lng: -72.7107 },
  'WI': { lat: 44.2615, lng: -89.6685 },
  'WV': { lat: 38.4912, lng: -80.9545 },
  'WY': { lat: 42.7555, lng: -107.3025 },
  
  // Territories
  // Regions
  'Southeast': { lat: 33.0, lng: -85.0 },
  'West': { lat: 40.0, lng: -120.0 },
  'Northeast': { lat: 42.0, lng: -75.0 },
  'Midwest': { lat: 42.0, lng: -90.0 },
};

const GeographicalMap: React.FC<GeographicalMapProps> = ({
  isLoading,
  showData,
  hasNpiFile,
  filters,
  selectedModelData,
  selectedNpiListName
}) => {
  const [mapData, setMapData] = useState<GeographicalMapData[]>([]);
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
      setMapData([]);
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
      latitude: number;
      longitude: number;
      specialty?: string;
    }>;

    // Filter valid coords
    const valid = providers.filter((p) => !isNaN(p.latitude) && !isNaN(p.longitude) && p.latitude !== 0 && p.longitude !== 0);

    const locationGroups = valid.reduce((acc, item) => {
      let groupKey = '';
      if (filters.groupingLevel === 'state') {
        groupKey = item.state || 'Unknown';
      } else if (filters.groupingLevel === 'city') {
        groupKey = item.city && item.state ? `${item.city}, ${item.state}` : '';
      } else if (filters.groupingLevel === 'zipcode') {
        groupKey = item.zip_code || '';
      }
      if (!groupKey || groupKey === 'Unknown') return acc;
      if (!acc[groupKey]) acc[groupKey] = [];
      acc[groupKey].push(item);
      return acc;
    }, {} as Record<string, typeof valid>);

    const aggregatedData: GeographicalMapData[] = [];

    Object.entries(locationGroups).forEach(([groupName, groupItems]) => {
      if ((filters.groupingLevel === 'zipcode' || filters.groupingLevel === 'city') && groupItems.length < 2) return;

      let coords: { lat: number; lng: number };
      if (filters.groupingLevel === 'zipcode' || filters.groupingLevel === 'city') {
        // Use average of all provider coordinates for city/zipcode
        coords = {
          lat: groupItems.reduce((sum, item) => sum + Number(item.latitude), 0) / groupItems.length,
          lng: groupItems.reduce((sum, item) => sum + Number(item.longitude), 0) / groupItems.length
        };
      } else {
        coords = geographicalCenters[groupName] || { lat: 39.8283, lng: -98.5795 };
      }
      if (isNaN(coords.lat) || isNaN(coords.lng)) return;

      const totalPatients = groupItems.reduce((sum, item) => sum + (item.patients || 0), 0);
      const highRiskPatients = groupItems.reduce((sum, item) => sum + (item.patients_phenom || 0), 0);
      const avgPhenomScore = Math.round(groupItems.reduce((sum, item) => sum + (item.phenom_lift_potential || 0), 0) / groupItems.length);
      const newTargets = selectedNpiListName ? groupItems.filter(x => !x.is_client_target).length : 0;

      const specialtyCounts = groupItems.reduce((acc, item) => {
        const spec = item.specialty || 'Unknown';
        acc[spec] = (acc[spec] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      const topSpecialties = Object.entries(specialtyCounts)
        .sort(([,a], [,b]) => (b as number) - (a as number))
        .slice(0, 3)
        .map(([specialty]) => specialty);

      let potential: 'High Potential' | 'Medium Potential' | 'Low Potential' = 'Low Potential';
      if (avgPhenomScore >= 20) potential = 'High Potential';
      else if (avgPhenomScore >= 15) potential = 'Medium Potential';

      let displayName = groupName;
      if (filters.groupingLevel === 'zipcode') {
        displayName = `${groupName}`;
      } else if (filters.groupingLevel === 'city') {
        displayName = groupName; // Already formatted as "City, State"
      }

      aggregatedData.push({
        id: groupName,
        name: displayName,
        type: filters.groupingLevel,
        latitude: coords.lat,
        longitude: coords.lng,
        providerCount: groupItems.length,
        newTargetCount: newTargets,
        totalPatients,
        highRiskPatients,
        topSpecialties,
        phenomLiftScore: avgPhenomScore,
        phenomLiftPotential: potential
      });
    });

    setMapData(aggregatedData);
  }, [showData, isLoading, filters, selectedModelData, sharedData, isFetching, selectedNpiListName]);

  // Calculate map center and zoom based on data
  const getMapBounds = () => {
    if (mapData.length === 0) {
      return { center: [39.8283, -98.5795] as [number, number], zoom: 4 };
    }

    const validPoints = mapData.filter(d => !isNaN(d.latitude) && !isNaN(d.longitude));
    
    if (validPoints.length === 0) {
      return { center: [39.8283, -98.5795] as [number, number], zoom: 4 };
    }

    // Calculate centroid
    const avgLat = validPoints.reduce((sum, p) => sum + p.latitude, 0) / validPoints.length;
    const avgLng = validPoints.reduce((sum, p) => sum + p.longitude, 0) / validPoints.length;

    // Calculate bounds
    const lats = validPoints.map(p => p.latitude);
    const lngs = validPoints.map(p => p.longitude);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    // Calculate appropriate zoom level based on bounds
    const latDiff = maxLat - minLat;
    const lngDiff = maxLng - minLng;
    const maxDiff = Math.max(latDiff, lngDiff);

    let zoom = 4;
    if (maxDiff < 0.5) zoom = 10;
    else if (maxDiff < 1) zoom = 9;
    else if (maxDiff < 2) zoom = 8;
    else if (maxDiff < 5) zoom = 7;
    else if (maxDiff < 10) zoom = 6;
    else if (maxDiff < 20) zoom = 5;

    return { center: [avgLat, avgLng] as [number, number], zoom };
  };

  const mapBounds = getMapBounds();
  if (isLoading || dataLoading) {
    return (
      <Card className="shadow-lg border-0 bg-white rounded-xl overflow-hidden">
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
      <Card className="shadow-lg border-0 bg-white rounded-xl overflow-hidden">
        <CardContent className="p-8 text-center text-gray-500">
          Select a model to load Regional Map
        </CardContent>
      </Card>
    );
  }

  if (mapData.length === 0) {
    return (
      <Card className="shadow-lg border-0 bg-white rounded-xl overflow-hidden">
        <CardContent className="p-6 text-center text-red-500">
          Data load still in progress
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
      'High Potential': 'bg-blue-700 text-white border-blue-800 hover:bg-blue-800 hover:text-white',
      'Medium Potential': 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200 hover:text-blue-800',
      'Low Potential': 'bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-100 hover:text-gray-800'
    };
    return variants[potential] || variants['Low Potential'];
  };

  // Component to handle map updates
  const MapUpdater = ({ center, zoom }: { center: [number, number]; zoom: number }) => {
    const map = useMap();
    
    useEffect(() => {
      map.setView(center, zoom, { animate: true, duration: 0.5 });
    }, [center[0], center[1], zoom, map]);
    
    return null;
  };

  return (
    <TooltipProvider>
    <Card className="shadow-lg border-0 bg-white rounded-xl overflow-hidden">
      <CardContent className="p-0">
        <div className="relative h-[750px]">
          {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
          {/* @ts-ignore */}
          <MapContainer
            center={mapBounds.center}
            zoom={mapBounds.zoom}
            scrollWheelZoom={false}
            style={{ height: '100%', width: '100%' }}
            className="z-0"
            attributionControl={false}
          >
            <MapUpdater center={mapBounds.center} zoom={mapBounds.zoom} />
            {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
            {/* @ts-ignore */}
            <TileLayer
              url="https://tiles.stadiamaps.com/tiles/stamen_toner_lite/{z}/{x}/{y}{r}.png"
              attribution=""
            />
            
            {mapData
              .filter(area => !isNaN(area.latitude) && !isNaN(area.longitude))
              .map((area) => (
              /* eslint-disable-next-line @typescript-eslint/ban-ts-comment */
              /* @ts-ignore */
              <Marker
                key={area.id}
                position={[area.latitude, area.longitude]}
                icon={createCustomIcon(area.phenomLiftPotential)}
              >
                  <Popup>
                    <div className="p-3 min-w-64">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-bold text-blue-900 text-lg">{area.name}</h3>
                          <Badge variant="outline" className="text-xs">
                            {getTypeLabel(area.type)}
                          </Badge>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Badge variant="outline" className={`text-xs ${getPotentialBadgeClass(area.phenomLiftPotential)}`}>
                            {area.phenomLiftPotential}
                          </Badge>
                          {hasNpiFile && area.newTargetCount > 0 && (
                            <Badge 
                              variant="outline" 
                              className="bg-blue-50 text-blue-700 border-blue-200"
                            >
                              {area.newTargetCount} New Targets
                            </Badge>
                          )}
                        </div>
                      </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="font-medium text-gray-700">Providers:</span>
                          <div className="font-bold text-lg">{area.providerCount}</div>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Patients:</span>
                          <div className="font-bold text-lg">{area.totalPatients.toLocaleString()}</div>
                        </div>
                      </div>


                      {/* High Risk PhenOM Patients */}
                      <div className="pt-2 border-t border-gray-100 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <span className="font-medium text-gray-700">High Risk PhenOM Patients</span>
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
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
        
        {/* Legend */}
        <div className="p-4 bg-gray-50 border-t rounded-b-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="text-sm font-medium text-gray-700">Legend:</div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow"></div>
                  <span className="text-xs text-gray-600">High Potential</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-100 rounded-full border-2 border-white shadow"></div>
                  <span className="text-xs text-gray-600">Medium Potential</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-600 rounded-full border-2 border-white shadow"></div>
                  <span className="text-xs text-gray-600">Low Potential</span>
                </div>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              Click markers for detailed geographical information
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
    </TooltipProvider>
  );
};

export default GeographicalMap;