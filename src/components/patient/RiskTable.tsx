import { Person } from '@/types/population';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '../ui/table';
import { usePatientData } from '@/hooks/usePatientData';
import { RiskTableRow } from './RiskTableRow';

interface RiskTableProps {
  currentRisks: Person | undefined;
  selectedRiskType: 'relative' | 'absolute';
  allRisks: Person[];
}

export const RiskTable = ({ currentRisks, selectedRiskType, allRisks }: RiskTableProps) => {
  const riskFactors = ['ED', 'Hospitalization', 'Fall', 'Stroke', 'MI'];
  const { data: patientData } = usePatientData();

  // Calculate global min and max for all sparklines
  const allSparklineData = riskFactors.map(risk => {
    return allRisks
      .filter(r => r.risk_type === selectedRiskType)
      .sort((a, b) => {
        if (!a.recorded_date || !b.recorded_date) return 0;
        return new Date(a.recorded_date).getTime() - new Date(b.recorded_date).getTime();
      })
      .map(risk => {
        const value = risk[risk as keyof Person];
        return typeof value === 'number' ? value : 0;
      });
  }).flat();

  const globalMin = Math.min(...allSparklineData);
  const globalMax = Math.max(...allSparklineData);
  
  // Add padding to the domain
  const padding = (globalMax - globalMin) * 0.1;
  const yAxisDomain: [number, number] = [
    Math.max(0, globalMin - padding),
    globalMax + padding
  ];

  const calculateAverageRisk = (riskFactor: string, timeframe: number | undefined) => {
    if (!patientData || !timeframe) return 'N/A';
    
    const relevantRisks = patientData.filter(
      p => p.risk_type === 'absolute' && 
      p.prediction_timeframe_yrs === timeframe
    );

    if (relevantRisks.length === 0) return 'N/A';

    const sum = relevantRisks.reduce((acc, curr) => {
      const value = curr[riskFactor as keyof Person];
      return acc + (typeof value === 'number' ? value : 0);
    }, 0);

    const avg = sum / relevantRisks.length;
    return `${Math.round(avg)}%`;
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Risk Factor</TableHead>
            <TableHead>Risk Trend</TableHead>
            <TableHead>Risk Value</TableHead>
            <TableHead>Calculated Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {riskFactors.map((risk) => (
            <RiskTableRow
              key={risk}
              risk={risk}
              currentRisks={currentRisks}
              selectedRiskType={selectedRiskType}
              allRisks={allRisks.filter(r => r.risk_type === selectedRiskType)}
              averageRisk={calculateAverageRisk(risk, currentRisks?.prediction_timeframe_yrs)}
              yAxisDomain={yAxisDomain}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};