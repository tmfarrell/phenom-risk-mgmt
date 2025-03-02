
import { Person } from '@/types/population';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '../ui/table';
import { usePatientData } from '@/hooks/usePatientData';
import { RiskTableRow } from './RiskTableRow';
import { RiskSummary } from '@/hooks/useRiskSummaries';

interface RiskTableProps {
  currentRisks: Person | undefined;
  selectedRiskType: 'relative' | 'absolute';
  allRisks: Person[];
  riskSummaries?: RiskSummary[];
}

export const RiskTable = ({ currentRisks, selectedRiskType, allRisks, riskSummaries = [] }: RiskTableProps) => {
  const riskFactors = ['ED', 'Hospitalization', 'Fall', 'Stroke', 'MI'];
  const { data: patientData } = usePatientData();

  // Set y-axis domain based on risk type
  const yAxisDomain: [number, number] = selectedRiskType === 'relative' 
    ? [0, 7.5]  // Updated domain for relative risk
    : [0, 100]; // Domain for absolute risk

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

  // Map fact_type values to our risk factor names
  const factTypeMapping: { [key: string]: string } = {
    'EMERGENCY_VISIT': 'ED',
    'HOSPITALIZATION': 'Hospitalization',
    'FALL': 'Fall',
    'STROKE': 'Stroke',
    'INFARCTION': 'MI'
  };

  // Get summary for a specific risk factor
  const getSummary = (riskFactor: string) => {
    // Convert our risk factor name to the database fact_type
    const factTypeKeys = Object.keys(factTypeMapping);
    const factType = factTypeKeys.find(key => factTypeMapping[key] === riskFactor);
    
    if (!factType) return null;
    
    return riskSummaries.find(s => s.fact_type === factType)?.summary || null;
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Risk</TableHead>
            <TableHead>Risk Trend</TableHead>
            <TableHead>Risk Value</TableHead>
            <TableHead>Last Updated</TableHead>
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
              summary={getSummary(risk)}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
