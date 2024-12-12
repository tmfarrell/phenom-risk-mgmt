import { Person } from '../types/population';
import { Card } from './ui/card';
import { usePatientData } from '@/hooks/usePatientData';
import { useState } from 'react';
import { RiskTrendsChart } from './RiskTrendsChart';
import { PatientHeader } from './patient/PatientHeader';
import { RiskControls } from './patient/RiskControls';
import { RiskTable } from './patient/RiskTable';

interface DetailViewProps {
  person: Person | null;
}

export const DetailView = ({ person }: DetailViewProps) => {
  const [selectedRiskType, setSelectedRiskType] = useState<'relative' | 'absolute'>('relative');
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('1');

  if (!person) {
    return (
      <Card className="p-6 text-center text-gray-500">
        Select a person to view details
      </Card>
    );
  }

  const { data: patientData } = usePatientData();
  const patientRisks = patientData?.filter(p => p.patient_id === person.patient_id) || [];
  
  // Get the latest risks for each timeframe and risk type
  const latestRisks = patientRisks
    .filter(p => p.risk_type === selectedRiskType && p.prediction_timeframe_yrs === Number(selectedTimeframe))
    .reduce((acc, curr) => {
      const key = `${curr.prediction_timeframe_yrs}`;
      if (!acc[key] || new Date(curr.recorded_date || '') > new Date(acc[key].recorded_date || '')) {
        acc[key] = curr;
      }
      return acc;
    }, {} as Record<string, Person>);

  const currentRisks = latestRisks[selectedTimeframe];

  // Filter risks for the selected risk type for the trends chart
  const selectedTypeRisks = patientRisks.filter(p => 
    p.risk_type === selectedRiskType && 
    p.prediction_timeframe_yrs === Number(selectedTimeframe)
  );

  return (
    <Card className="p-6">
      <PatientHeader person={person} />
      
      <RiskControls 
        selectedTimeframe={selectedTimeframe}
        selectedRiskType={selectedRiskType}
        onTimeframeChange={setSelectedTimeframe}
        onRiskTypeChange={setSelectedRiskType}
      />

      <RiskTable 
        currentRisks={currentRisks}
        selectedRiskType={selectedRiskType}
      />

      <RiskTrendsChart 
        data={selectedTypeRisks} 
        selectedRiskType={selectedRiskType} 
      />
    </Card>
  );
};