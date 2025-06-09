
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
  const riskFactors = ['ED', 'Hospitalization', 'Fall', 'Stroke', 'MI', 'Mortality'];
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

  // Map our risk factor names to the database fact_type values
  const riskFactorToFactType: { [key: string]: string } = {
    'ED': 'EMERGENCY_VISIT',
    'Hospitalization': 'HOSPITALIZATION',
    'Fall': 'FALL',
    'Stroke': 'STROKE',
    'MI': 'INFARCTION',
    'Mortality': 'DEATH'
  };

  // Get summary for a specific risk factor
  const getSummary = (riskFactor: string) => {
    const factType = riskFactorToFactType[riskFactor];
    
    if (!factType) return null;
    
    const summary = riskSummaries.find(s => 
      s.fact_type === factType
    );
    
    console.log(`Looking for summary: factor=${riskFactor}, fact_type=${factType}, risk_type=${selectedRiskType}, time_period=${currentRisks?.prediction_timeframe_yrs}`);
    console.log('Found summary:', summary);
    
    return summary?.summary || null;
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Outcome</TableHead>
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
