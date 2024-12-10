import { Person } from '../types/population';
import { Card } from './ui/card';
import { Avatar, AvatarFallback } from './ui/avatar';
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

  // Get all risk predictions for this patient
  const { data: patientData } = usePatientData();
  const patientRisks = patientData?.filter(p => 
    p.patient_id === person.patient_id && 
    p.risk_type === selectedRiskType
  ) || [];
  
  // Get predictions for each timeframe
  const oneYearRisks = patientRisks.find(p => p.prediction_timeframe_yrs === 1);
  const fiveYearRisks = patientRisks.find(p => p.prediction_timeframe_yrs === 5);

  const riskFactors = ['ED', 'Hospitalization', 'Fall', 'Stroke', 'MI', 'CKD', 'Mental Health'];

  const isHighRisk = (value: number | string | null | undefined, riskType: 'relative' | 'absolute') => {
    if (typeof value !== 'number') return false;
    return riskType === 'absolute' ? value > 50 : value > 5;
  };

  return (
    <div className="space-y-4">
      <Card className="detail-card p-6">
        <div className="flex items-center space-x-4 mb-6 pb-6 border-b">
          <Avatar className="h-20 w-20">
            <AvatarFallback>{person.name?.[0] || '?'}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-2xl font-bold">{person.name || 'Unknown'}</h2>
            <p className="text-gray-500">Patient ID: {person.patient_id}</p>
          </div>
        </div>
        <div className="grid grid-cols-6 gap-4">
          <div className="text-center">
            <span className="text-gray-500 block mb-2">Age</span>
            <span className="font-medium">{person.age || 'Not specified'}</span>
          </div>
          <div className="text-center">
            <span className="text-gray-500 block mb-2">Date of Birth</span>
            <span className="font-medium">{person.dob || 'Not specified'}</span>
          </div>
          <div className="text-center">
            <span className="text-gray-500 block mb-2">Gender</span>
            <span className="font-medium">{person.gender || 'Not specified'}</span>
          </div>
          <div className="text-center">
            <span className="text-gray-500 block mb-2">Location</span>
            <span className="font-medium">{person.location || 'Not specified'}</span>
          </div>
          <div className="text-center">
            <span className="text-gray-500 block mb-2">MRN</span>
            <span className="font-medium">{person.mrn || 'Not specified'}</span>
          </div>
          <div className="text-center">
            <span className="text-gray-500 block mb-2">Last Visit</span>
            <span className="font-medium">{person.last_visit || 'Not specified'}</span>
          </div>
        </div>
      </Card>

      <Card className="detail-card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Risk Factors</h3>
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
                  <TableCell className={isHighRisk(oneYearRisks?.[risk as keyof Person], selectedRiskType) ? 'bg-red-100' : ''}>
                    {formatRiskValue(oneYearRisks?.[risk as keyof Person], selectedRiskType)}
                  </TableCell>
                  <TableCell className={isHighRisk(fiveYearRisks?.[risk as keyof Person], selectedRiskType) ? 'bg-red-100' : ''}>
                    {formatRiskValue(fiveYearRisks?.[risk as keyof Person], selectedRiskType)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};