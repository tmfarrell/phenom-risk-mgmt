import { Person } from '../types/population';
import { Card } from './ui/card';
import { usePatientData } from '@/hooks/usePatientData';
import { useState } from 'react';
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
        />

        <RiskTable 
          currentRisks={latestRisk}
          selectedRiskType={selectedRiskType}
          allRisks={selectedTypeRisks}
        />
      </Card>
    </div>
  );
};