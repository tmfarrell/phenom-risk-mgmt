
import { Person } from '../types/population';
import { Card } from './ui/card';
import { usePatientData } from '@/hooks/usePatientData';
import { useState, useMemo, useEffect } from 'react';
import { PatientHeader } from './patient/PatientHeader';
import { RiskControls } from './patient/RiskControls';
import { RiskTable } from './patient/RiskTable';
import { useRiskSummaries } from '@/hooks/useRiskSummaries';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLocation } from 'react-router-dom';

export interface DetailViewProps {
  person: Person | null;
  initialOutcomes?: string[] | null;
  initialTimeframe?: string | null;
  initialRiskType?: 'relative' | 'absolute' | null;
}

type RowConfig = { outcome: string; timeframe: string };

export const DetailView = ({ person, initialOutcomes, initialTimeframe, initialRiskType }: DetailViewProps) => {
  const location = useLocation();
  const savedState = location.state as {
    selectedRiskColumns?: string[];
    selectedTimeframe?: string;
    selectedRiskType?: 'relative' | 'absolute';
  } | null;

  const [selectedRiskType, setSelectedRiskType] = useState<'relative' | 'absolute'>(initialRiskType || savedState?.selectedRiskType || 'relative');
  const [rowConfigs, setRowConfigs] = useState<RowConfig[]>([]);

  // Fetch available outcomes and timeframes (and models) from phenom_models
  const { data: phenomModelsData, isLoading: isModelsLoading } = useQuery({
    queryKey: ['detail-phenom-models'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('phenom_models')
        .select('id, indication_code, prediction_timeframe_yrs')
        .not('prediction_timeframe_yrs', 'is', null)
        .order('indication_code');
      if (error) {
        console.error('Error fetching phenom_models:', error);
        throw error;
      }
      const outcomeTimeframeMap: Record<string, number[]> = {};
      data?.forEach(item => {
        if (!outcomeTimeframeMap[item.indication_code]) outcomeTimeframeMap[item.indication_code] = [];
        if (!outcomeTimeframeMap[item.indication_code].includes(item.prediction_timeframe_yrs)) {
          outcomeTimeframeMap[item.indication_code].push(item.prediction_timeframe_yrs);
        }
      });
      const uniqueTimeframes = [...new Set(data?.map(item => item.prediction_timeframe_yrs) || [])].filter(Boolean).sort();
      const availableOutcomes = Object.keys(outcomeTimeframeMap).sort();
      return {
        outcomeTimeframeMap,
        timeframes: uniqueTimeframes as number[],
        availableOutcomes
      };
    }
  });

  const timePeriods = phenomModelsData?.timeframes || [1, 2];
  const availableOutcomes = phenomModelsData?.availableOutcomes || ['ED', 'Hospitalization', 'Fall', 'Stroke', 'HS', 'Mortality'];

  // Initialize row configurations once models are loaded
  const initializedRowConfigs = useMemo(() => {
    if (!phenomModelsData) return null;
    const tf = initialTimeframe || savedState?.selectedTimeframe || (phenomModelsData.timeframes?.[0]?.toString() || '1');
    const outcomes = (initialOutcomes && initialOutcomes.length > 0)
      ? initialOutcomes
      : (savedState?.selectedRiskColumns && savedState.selectedRiskColumns.length > 0)
        ? savedState.selectedRiskColumns
        : availableOutcomes.slice(0, Math.min(5, availableOutcomes.length));
    return outcomes.map(o => ({ outcome: o, timeframe: tf }));
  }, [phenomModelsData, initialOutcomes, initialTimeframe, availableOutcomes, savedState?.selectedRiskColumns, savedState?.selectedTimeframe]);

  // Set initial rows when ready
  useEffect(() => {
    if (rowConfigs.length === 0 && initializedRowConfigs) {
      setRowConfigs(initializedRowConfigs);
    }
  }, [initializedRowConfigs, rowConfigs.length]);

  if (!person) {
    return (
      <Card className="p-6 text-center text-gray-500">
        Select a person to view details
      </Card>
    );
  }

  const { data: patientData } = usePatientData();
  const { data: riskSummaries = [], isLoading: isLoadingSummaries } = useRiskSummaries(person.patient_id);
  
  // Filter data for the current patient
  const patientRisks = (patientData || []).filter(p => p.patient_id === person.patient_id);
  
  console.log("riskSummaries", riskSummaries);
  
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <PatientHeader person={person} />
      </Card>
      
      <Card className="p-6">
        <RiskControls 
          selectedTimeframe={rowConfigs[0]?.timeframe || (timePeriods[0]?.toString() || '1')}
          selectedRiskType={selectedRiskType}
          onTimeframeChange={() => { /* hidden in detail view */ }}
          onRiskTypeChange={setSelectedRiskType}
          timeframes={timePeriods}
          hideTimeframe
        />

        {isModelsLoading || !phenomModelsData ? (
          <div className="py-4 text-center text-gray-500">Loading models...</div>
        ) : isLoadingSummaries ? (
          <div className="py-4 text-center text-gray-500">Loading risk summaries...</div>
        ) : (
          <RiskTable 
            selectedRiskType={selectedRiskType}
            patientRisks={patientRisks}
            riskSummaries={riskSummaries}
            rowConfigs={rowConfigs}
            onRemoveRow={(index) => {
              setRowConfigs(prev => prev.filter((_, i) => i !== index));
            }}
            onAddRow={(outcome, timeframe) => {
              setRowConfigs(prev => {
                const exists = prev.some(r => r.outcome === outcome && r.timeframe === timeframe);
                if (exists) return prev;
                return [...prev, { outcome, timeframe }];
              });
            }}
            availableOutcomes={availableOutcomes}
            timeframes={timePeriods}
            outcomeTimeframeMap={phenomModelsData.outcomeTimeframeMap}
          />
        )}
      </Card>
    </div>
  );
};
