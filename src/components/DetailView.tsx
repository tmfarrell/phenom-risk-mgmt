
import { Person } from '../types/population';
import { Card } from './ui/card';
import { usePatientData } from '@/hooks/usePatientData';
import { useState, useEffect } from 'react';
import { PatientHeader } from './patient/PatientHeader';
import { RiskControls } from './patient/RiskControls';
import { RiskTable } from './patient/RiskTable';
import { useRiskSummaries } from '@/hooks/useRiskSummaries';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface DetailViewProps {
  person: Person | null;
}

export const DetailView = ({ person }: DetailViewProps) => {
  const [selectedRiskType, setSelectedRiskType] = useState<'relative' | 'absolute'>('relative');
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('1');

  // Fetch available time periods from the database
  const { data: fetchedTimePeriods, isLoading: isTimePeriodsLoading } = useQuery({
    queryKey: ['detail-time-periods', person?.patient_id],
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
      console.log('Unique time periods for Detail page:', uniqueTimePeriods);
      
      return uniqueTimePeriods.length > 0 ? uniqueTimePeriods : [1, 2]; // Default if empty
    }
  });
  
  // Get time periods from fetched data or patient data as fallback
  const timePeriods = fetchedTimePeriods || [1, 2]; 
  
  // Update selected timeframe when time periods are loaded
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
  const patientRisks = patientData?.filter(p => p.patient_id === person.patient_id) || [];
  
  // Get the latest risk record for the selected risk type and timeframe
  const latestRisk = patientRisks
    .filter(p => 
      p.risk_type === selectedRiskType && 
      p.prediction_timeframe_yrs === Number(selectedTimeframe)
    )
    .sort((a, b) => {
      if (!a.recorded_date || !b.recorded_date) return 0;
      return new Date(b.recorded_date).getTime() - new Date(a.recorded_date).getTime();
    })[0];

  // Filter risks for the selected risk type and timeframe
  const selectedTypeRisks = patientRisks.filter(p => 
    p.risk_type === selectedRiskType && 
    p.prediction_timeframe_yrs === Number(selectedTimeframe)
  );

  console.log("selectedTypeRisks", selectedTypeRisks); 
  console.log("riskSummaries", riskSummaries);
  
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <PatientHeader person={person} />
      </Card>
      
      <Card className="p-6">
        <RiskControls 
          selectedTimeframe={selectedTimeframe}
          selectedRiskType={selectedRiskType}
          onTimeframeChange={setSelectedTimeframe}
          onRiskTypeChange={setSelectedRiskType}
          timeframes={isTimePeriodsLoading ? [1, 2] : timePeriods}
        />

        {isLoadingSummaries ? (
          <div className="py-4 text-center text-gray-500">Loading risk summaries...</div>
        ) : (
          <RiskTable 
            currentRisks={latestRisk}
            selectedRiskType={selectedRiskType}
            allRisks={selectedTypeRisks}
            riskSummaries={riskSummaries}
          />
        )}
      </Card>
    </div>
  );
};
