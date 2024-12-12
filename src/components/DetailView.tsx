import { Person } from '../types/population';
import { Card } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { usePatientData } from '@/hooks/usePatientData';
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface DetailViewProps {
  person: Person | null;
}

export const DetailView = ({ person }: DetailViewProps) => {
  const [selectedRiskType, setSelectedRiskType] = useState<'relative' | 'absolute'>('relative');

  if (!person) {
    return (
      <Card className="p-6 text-center text-gray-500">
        Select a person to view details
      </Card>
    );
  }

  const formatRiskValue = (value: number | string | null | undefined, riskType: 'relative' | 'absolute') => {
    if (typeof value === 'number') {
      if (riskType === 'absolute') {
        return `${Math.round(value)}%`;
      }
      return value.toFixed(2);
    }
    return 'Not available';
  };

  const { data: patientData } = usePatientData();
  const patientRisks = patientData?.filter(p => 
    p.patient_id === person.patient_id && 
    p.risk_type === selectedRiskType
  ) || [];
  
  const oneYearRisks = patientRisks.find(p => p.prediction_timeframe_yrs === 1);
  const fiveYearRisks = patientRisks.find(p => p.prediction_timeframe_yrs === 5);

  const riskFactors = ['ED', 'Hospitalization', 'Fall', 'Stroke', 'MI', 'CKD', 'Mental Health'];
  const riskFieldMap = {
    'Mental Health': 'Mental_Health',
  };

  const isHighRisk = (value: number | string | null | undefined, riskType: 'relative' | 'absolute') => {
    if (typeof value !== 'number') return false;
    return riskType === 'absolute' ? value > 50 : value > 5;
  };

  const getRiskValue = (risks: Person | undefined, riskFactor: string) => {
    if (!risks) return null;
    const fieldName = riskFieldMap[riskFactor as keyof typeof riskFieldMap] || riskFactor;
    return risks[fieldName as keyof Person];
  };

  return (
    <Card className="p-6">
      <div>
        <h2 className="text-2xl font-bold text-left mb-2">
          {person.name || 'Unknown'}
          <span className="font-normal">
            {person.age && person.gender ? ` (${person.age}${person.gender?.[0]})` : ''}
          </span>
        </h2>
        <p className="text-gray-500 text-left mb-6">
          MRN: {person.mrn || 'N/A'} | DOB: {person.dob || 'N/A'} | Last visit: {person.last_visit || 'N/A'}
        </p>
      </div>

      <div className="flex justify-end items-center mb-4">
        <ToggleGroup 
          type="single" 
          value={selectedRiskType}
          onValueChange={(value) => {
            if (value) setSelectedRiskType(value as 'relative' | 'absolute');
          }}
          className="flex gap-2"
        >
          <ToggleGroupItem 
            value="relative" 
            className={cn(
              "px-4 py-2 rounded-md",
              selectedRiskType === 'relative' ? "bg-blue-100 hover:bg-blue-200" : "hover:bg-gray-100"
            )}
          >
            Relative
          </ToggleGroupItem>
          <ToggleGroupItem 
            value="absolute"
            className={cn(
              "px-4 py-2 rounded-md",
              selectedRiskType === 'absolute' ? "bg-blue-100 hover:bg-blue-200" : "hover:bg-gray-100"
            )}
          >
            Absolute
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Risk Factor</TableHead>
              <TableHead>1 Year Risk</TableHead>
              <TableHead>5 Year Risk</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {riskFactors.map((risk) => (
              <TableRow key={risk}>
                <TableCell className="font-medium">{risk}</TableCell>
                <TableCell className={isHighRisk(getRiskValue(oneYearRisks, risk), selectedRiskType) ? 'bg-red-100' : ''}>
                  {formatRiskValue(getRiskValue(oneYearRisks, risk), selectedRiskType)}
                </TableCell>
                <TableCell className={isHighRisk(getRiskValue(fiveYearRisks, risk), selectedRiskType) ? 'bg-red-100' : ''}>
                  {formatRiskValue(getRiskValue(fiveYearRisks, risk), selectedRiskType)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};