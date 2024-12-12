import { Person } from '../types/population';
import { Card } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { usePatientData } from '@/hooks/usePatientData';
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { RiskTrendsChart } from './RiskTrendsChart';
import { format } from 'date-fns';

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

  // Filter risks for the selected risk type for the trends chart
  const selectedTypeRisks = patientRisks.filter(p => 
    p.risk_type === selectedRiskType && 
    p.prediction_timeframe_yrs === Number(selectedTimeframe)
  );

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

      <div className="flex justify-end items-center gap-4 mb-4">
        <ToggleGroup 
          type="single" 
          value={selectedTimeframe}
          onValueChange={(value) => {
            if (value) setSelectedTimeframe(value);
          }}
          className="flex gap-2"
        >
          <ToggleGroupItem 
            value="1" 
            className={cn(
              "px-4 py-2 rounded-md",
              selectedTimeframe === '1' ? "bg-blue-100 hover:bg-blue-200" : "hover:bg-gray-100"
            )}
          >
            1 Year
          </ToggleGroupItem>
          <ToggleGroupItem 
            value="5"
            className={cn(
              "px-4 py-2 rounded-md",
              selectedTimeframe === '5' ? "bg-blue-100 hover:bg-blue-200" : "hover:bg-gray-100"
            )}
          >
            5 Years
          </ToggleGroupItem>
        </ToggleGroup>

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
              <TableHead>Calculated Date</TableHead>
              <TableHead>Risk Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {riskFactors.map((risk) => (
              <TableRow key={risk}>
                <TableCell className="font-medium">{risk}</TableCell>
                <TableCell>
                  {currentRisks?.recorded_date ? format(new Date(currentRisks.recorded_date), 'yyyy-MM-dd') : 'N/A'}
                </TableCell>
                <TableCell className={isHighRisk(getRiskValue(currentRisks, risk), selectedRiskType) ? 'bg-red-100' : ''}>
                  {formatRiskValue(getRiskValue(currentRisks, risk), selectedRiskType)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <RiskTrendsChart 
        data={selectedTypeRisks} 
        selectedRiskType={selectedRiskType} 
      />
    </Card>
  );
};