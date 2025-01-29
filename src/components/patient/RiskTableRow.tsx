import { TableCell, TableRow } from "@/components/ui/table";
import { Person } from "@/types/population";
import { SparkLine } from "./SparkLine";
import { RiskChangeIndicator } from "./RiskChangeIndicator";
import { formatRiskValue, getRiskValue, getChangeValue } from "./utils/riskUtils";
import { format } from "date-fns";

interface RiskTableRowProps {
  risk: string;
  currentRisks: Person | undefined;
  selectedRiskType: 'relative' | 'absolute';
  allRisks: Person[];
  averageRisk?: string;
  yAxisDomain?: [number, number];
}

export const RiskTableRow = ({
  risk,
  currentRisks,
  selectedRiskType,
  allRisks,
  averageRisk,
  yAxisDomain
}: RiskTableRowProps) => {
  const riskValue = getRiskValue(currentRisks, risk);
  const changeValue = getChangeValue(currentRisks, risk);

  // Transform data for SparkLine
  const sparklineData = allRisks
    .sort((a, b) => {
      if (!a.recorded_date || !b.recorded_date) return 0;
      return new Date(a.recorded_date).getTime() - new Date(b.recorded_date).getTime();
    })
    .map(risk => {
      const value = getRiskValue(risk, risk);
      return {
        value: typeof value === 'number' ? value : 0,
        date: risk.recorded_date || ''
      };
    });

  return (
    <TableRow>
      <TableCell className="font-medium">{risk}</TableCell>
      <TableCell>
        <SparkLine
          data={sparklineData}
          riskType={selectedRiskType}
          averageRisk={averageRisk}
          yAxisDomain={yAxisDomain}
        />
      </TableCell>
      <TableCell>
        {formatRiskValue(riskValue, selectedRiskType)}
      </TableCell>
      <TableCell>
        {currentRisks?.recorded_date ? (
          format(new Date(currentRisks.recorded_date), 'MM/dd/yyyy')
        ) : (
          'Not available'
        )}
      </TableCell>
      <TableCell>
        <RiskChangeIndicator
          change={changeValue}
          riskType={selectedRiskType}
        />
      </TableCell>
    </TableRow>
  );
};