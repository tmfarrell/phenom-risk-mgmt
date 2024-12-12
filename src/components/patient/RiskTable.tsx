import { Person } from '@/types/population';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { format } from 'date-fns';

interface RiskTableProps {
  currentRisks: Person | undefined;
  selectedRiskType: 'relative' | 'absolute';
}

export const RiskTable = ({ currentRisks, selectedRiskType }: RiskTableProps) => {
  const riskFactors = ['ED', 'Hospitalization', 'Fall', 'Stroke', 'MI', 'CKD', 'Mental Health'];
  const riskFieldMap = {
    'Mental Health': 'Mental_Health',
  };

  const formatRiskValue = (value: number | string | null | undefined, riskType: 'relative' | 'absolute') => {
    if (typeof value === 'number') {
      if (riskType === 'absolute') {
        return `${Math.round(value)}%`;
      }
      return value.toFixed(2);
    }
    return 'Not available';
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
  );
};